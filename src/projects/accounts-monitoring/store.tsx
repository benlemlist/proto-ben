// State of the accounts-monitoring proto. Version (V1 Maxime L / V2 Ben), deployed watch lists and the signals
// they found are persisted in localStorage; the agent run and selection are transient.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  COMPANIES, EXISTING_WATCHLISTS, LISTS, NEXT_SIGNALS, V1_CARDS, companiesOf, suggestionsFor,
  type FiredSignal, type Suggestion, type V1Card, type WatchList,
} from "./data";

const STORAGE_KEY = "accounts-monitoring-proto-v1";

export type Version = "v1" | "v2";
export interface ToastItem { id: number; type: "info" | "success" | "alert" | "warning"; title: string; subtitle?: string }

export interface Scope {
  listId: string;
  /** "list" = the whole CRM list (toolbar) · "selection" = bulk-selected companies. */
  kind: "list" | "selection";
  companyIds: string[];
  label: string;
}

export type RunPhase = "analysing" | "suggested" | "deploying" | "deployed";
export interface ChatMsg { role: "user" | "agent"; text: string }
export interface AgentRun {
  scope: Scope;
  phase: RunPhase;
  suggestions: Suggestion[];
  deployedIds: string[];
  chat: ChatMsg[];
}

interface Persisted {
  version: Version;
  watchlists: WatchList[];
  /** Signals found by the agents deployed in the proto, by company id. */
  newSignals: Record<string, FiredSignal[]>;
}

const seed = (version: Version = "v2"): Persisted => ({ version, watchlists: EXISTING_WATCHLISTS, newSignals: {} });

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* private window */ }
  return seed();
}

interface Store extends Persisted {
  setVersion: (v: Version) => void;
  listId: string;
  setListId: (id: string) => void;
  selected: string[];
  setSelected: (ids: string[] | ((ids: string[]) => string[])) => void;
  /** Agent panel open (both versions). */
  panelOpen: boolean;
  closePanel: () => void;
  // V1
  v1Cards: V1Card[];
  toggleV1Card: (id: string) => void;
  removeV1Card: (id: string) => void;
  openV1: () => void;
  // V2
  run: AgentRun | null;
  startRun: (kind: Scope["kind"], forList?: string) => void;
  toggleSuggestion: (id: string, on: boolean) => void;
  updateSuggestion: (id: string, patch: Partial<Suggestion>) => void;
  addSuggestion: (s: Suggestion) => void;
  say: (text: string, answer: string) => void;
  deploy: () => void;
  simulateSignals: () => void;
  /** Fired + newly found signals of a company. */
  signalsOf: (companyId: string) => FiredSignal[];
  watchlistsOf: (companyId: string) => WatchList[];
  reset: () => void;
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);

export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [listId, setListIdRaw] = useState("tier1");
  const [selected, setSelected] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [v1Cards, setV1Cards] = useState<V1Card[]>(V1_CARDS);
  const [run, setRun] = useState<AgentRun | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = ++toastId.current;
    setToasts((xs) => [...xs, { ...t, id }]);
    window.setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== id)), 5000);
  }, []);

  const closePanel = useCallback(() => { setPanelOpen(false); setRun(null); }, []);

  const setVersion = useCallback((version: Version) => {
    setState((s) => ({ ...s, version }));
    closePanel();
    setSelected([]);
  }, [closePanel]);

  const setListId = useCallback((id: string) => { setListIdRaw(id); setSelected([]); }, []);

  const openV1 = useCallback(() => { setV1Cards(V1_CARDS); setPanelOpen(true); setSelected([]); }, []);

  const startRun = useCallback((kind: Scope["kind"], forList?: string) => {
    const lid = forList ?? listId;
    if (forList) { setListIdRaw(forList); setSelected([]); }
    const list = LISTS.find((l) => l.id === lid)!;
    const ids = kind === "selection" ? selected : companiesOf(lid).map((c) => c.id);
    const label = kind === "selection" ? `${ids.length} selected ${ids.length > 1 ? "companies" : "company"}` : `${list.name} · ${ids.length} companies`;
    const scope: Scope = { listId: lid, kind, companyIds: ids, label };
    setRun({ scope, phase: "analysing", suggestions: [], deployedIds: [], chat: [] });
    setPanelOpen(true);
    later(() => setRun((r) => (r && r.scope === scope ? { ...r, phase: "suggested", suggestions: suggestionsFor(ids, state.watchlists) } : r)), 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, selected, state.watchlists]);

  const updateSuggestion = useCallback((id: string, patch: Partial<Suggestion>) => {
    setRun((r) => (r ? { ...r, suggestions: r.suggestions.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : r));
  }, []);
  const toggleSuggestion = useCallback((id: string, on: boolean) => updateSuggestion(id, { enabled: on }), [updateSuggestion]);
  const addSuggestion = useCallback((s: Suggestion) => {
    setRun((r) => (r ? { ...r, suggestions: r.suggestions.some((x) => x.id === s.id) ? r.suggestions.map((x) => (x.id === s.id ? { ...x, enabled: true } : x)) : [...r.suggestions, s] } : r));
  }, []);
  const say = useCallback((text: string, answer: string) => {
    setRun((r) => (r ? { ...r, chat: [...r.chat, { role: "user", text }, { role: "agent", text: answer }] } : r));
  }, []);

  const deploy = useCallback(() => {
    if (!run) return;
    const list = LISTS.find((l) => l.id === run.scope.listId)!;
    const on = run.suggestions.filter((s) => s.enabled && s.companyIds.length > 0);
    const listLabel = run.scope.kind === "selection" ? `${list.name} · selection (${run.scope.companyIds.length})` : list.name;
    const created: WatchList[] = on.map((s) => ({
      id: `wl-${s.type}-${Date.now().toString(36)}`,
      name: `${s.name} · ${list.name}`,
      type: s.type,
      segmentType: "list",
      listLabel,
      companyIds: s.companyIds,
      dailyLimit: s.dailyLimit,
      processing: s.processing,
      createdBy: "lemAgent",
    }));
    setRun({ ...run, phase: "deploying" });
    later(() => {
      setState((st) => ({ ...st, watchlists: [...st.watchlists, ...created] }));
      setRun((r) => (r ? { ...r, phase: "deployed", deployedIds: created.map((w) => w.id) } : r));
      setSelected([]);
    }, 1200);
  }, [run]);

  const simulateSignals = useCallback(() => {
    const mine = state.watchlists.filter((w) => w.createdBy === "lemAgent");
    if (!mine.length) { toast({ type: "info", title: "No agent deployed yet", subtitle: "Monitor a list in V2 first." }); return; }
    const next: Record<string, FiredSignal[]> = { ...state.newSignals };
    let n = 0;
    mine.forEach((w, wi) => {
      w.companyIds.filter((_, i) => (i + wi) % 4 === 0).slice(0, 3).forEach((id) => {
        next[id] = [{ type: w.type, daysAgo: 0, detail: NEXT_SIGNALS[w.type] ?? "New signal" }, ...(next[id] ?? []).filter((x) => x.type !== w.type)];
        n++;
      });
    });
    setState((st) => ({ ...st, newSignals: next }));
    toast({ type: "success", title: `${n} new signals on your monitored accounts`, subtitle: "They show first in the Signals column, marked New." });
  }, [state.watchlists, state.newSignals, toast]);

  const signalsOf = useCallback((id: string) => {
    const base = COMPANIES.find((c) => c.id === id)?.fired ?? [];
    const fresh = state.newSignals[id] ?? [];
    return [...fresh, ...base.filter((b) => !fresh.some((f) => f.type === b.type))];
  }, [state.newSignals]);
  const watchlistsOf = useCallback((id: string) => state.watchlists.filter((w) => w.companyIds.includes(id)), [state.watchlists]);

  const reset = useCallback(() => {
    setState((s) => seed(s.version));
    closePanel();
    setSelected([]);
    setListIdRaw("tier1");
  }, [closePanel]);

  const value = useMemo<Store>(() => ({
    ...state, setVersion, listId, setListId, selected, setSelected, panelOpen, closePanel,
    v1Cards,
    toggleV1Card: (id) => setV1Cards((cs) => cs.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))),
    removeV1Card: (id) => setV1Cards((cs) => cs.filter((c) => c.id !== id)),
    openV1,
    run, startRun, toggleSuggestion, updateSuggestion, addSuggestion, say, deploy, simulateSignals,
    signalsOf, watchlistsOf, reset,
    toasts, toast, dismissToast: (id) => setToasts((xs) => xs.filter((x) => x.id !== id)),
  }), [state, setVersion, listId, setListId, selected, panelOpen, closePanel, v1Cards, openV1, run, startRun, toggleSuggestion, updateSuggestion, addSuggestion, say, deploy, simulateSignals, signalsOf, watchlistsOf, reset, toasts, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMonitoring() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useMonitoring outside MonitoringProvider");
  return s;
}
