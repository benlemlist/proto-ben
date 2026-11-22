// State of the PeopleDB suggested-lists proto. Persisted in localStorage (except transient UI).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FRESH_SIGNALS, listsFor, type SuggestedList } from "./data";

const STORAGE_KEY = "peopledb-lists-proto-v1";

export interface ToastItem { id: number; type: "info" | "success" | "alert" | "warning"; title: string; subtitle?: string }

/** generating = lazy generation on first PeopleDB open; ready = feed shown. */
export type FeedState = "generating" | "ready";

interface Persisted {
  profileId: string;
  lists: SuggestedList[];
  /** Has this account already opened PeopleDB (lists generated)? */
  generated: boolean;
  agentPanel: boolean;
  signalsEmpty: boolean;
  freshRuns: number;
  theme: "light" | "dark";
}

function seed(profileId = "sales-tool"): Persisted {
  return { profileId, lists: listsFor(profileId), generated: true, agentPanel: true, signalsEmpty: false, freshRuns: 0, theme: "light" };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // Lists are rebuilt from data.ts (so data edits show up), only the proto's "fresh" lists come from storage.
      const saved = { ...seed(), ...JSON.parse(raw) } as Persisted;
      const base = listsFor(saved.profileId).map((l) => (l.section === "signal" ? { ...l, hoursAgo: (l.hoursAgo ?? 0) + 24 * saved.freshRuns } : l));
      const fresh = saved.lists.filter((l) => l.id.startsWith("fresh-"));
      return { ...saved, lists: [...fresh, ...base] };
    }
  } catch { /* private window */ }
  return seed();
}

interface Store extends Persisted {
  feed: FeedState;
  openListId: string | null;
  openList: (id: string | null) => void;
  setProfile: (id: string) => void;
  /** Proto: replay the first PeopleDB open of an existing account (lazy generation). */
  firstOpen: () => void;
  deliverFresh: () => void;
  setSignalsEmpty: (v: boolean) => void;
  setAgentPanel: (v: boolean) => void;
  setTheme: (t: "light" | "dark") => void;
  reset: () => void;
  commandsOpen: boolean;
  setCommandsOpen: (v: boolean) => void;
  prefsOpen: boolean;
  setPrefsOpen: (v: boolean) => void;
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 1;
const GENERATION_MS = 3200;

export function PeopleDbProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Persisted>(load);
  const [feed, setFeed] = useState<FeedState>(p.generated ? "ready" : "generating");
  const [openListId, setOpenListId] = useState<string | null>(() => new URLSearchParams(window.location.search).get("list"));
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  }, [p]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", p.theme);
    return () => document.documentElement.removeAttribute("data-theme");
  }, [p.theme]);

  // Lazy generation: lists appear after a few seconds, then the account is marked as generated.
  useEffect(() => {
    if (feed !== "generating") return;
    timer.current = window.setTimeout(() => {
      setP((s) => ({ ...s, generated: true }));
      setFeed("ready");
    }, GENERATION_MS);
    return () => window.clearTimeout(timer.current);
  }, [feed]);

  // Keep ?list= in the URL so a list view can be shared.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (openListId) url.searchParams.set("list", openListId); else url.searchParams.delete("list");
    window.history.replaceState(null, "", url);
  }, [openListId]);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = toastId++;
    setToasts((ts) => [...ts, { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5000);
  }, []);

  const store = useMemo<Store>(() => ({
    ...p,
    feed,
    openListId,
    openList: setOpenListId,
    setProfile: (id) => {
      setP((s) => ({ ...s, profileId: id, lists: listsFor(id), generated: false, freshRuns: 0 }));
      setOpenListId(null);
      setFeed("generating");
    },
    firstOpen: () => {
      setP((s) => ({ ...s, lists: listsFor(s.profileId), generated: false, freshRuns: 0 }));
      setOpenListId(null);
      setFeed("generating");
    },
    deliverFresh: () => {
      const tpl = FRESH_SIGNALS[p.freshRuns % FRESH_SIGNALS.length];
      const list: SuggestedList = { ...tpl, id: `fresh-${Date.now()}`, hoursAgo: 0 };
      setP((s) => ({
        ...s,
        signalsEmpty: false,
        freshRuns: s.freshRuns + 1,
        lists: [list, ...s.lists.map((l) => (l.section === "signal" ? { ...l, isNew: false, hoursAgo: (l.hoursAgo ?? 0) + 24 } : l))],
      }));
      setOpenListId(null);
      toast({ type: "info", title: "New lists from today's signals", subtitle: "Proto: one fresh signal list added, the others aged by a day." });
    },
    setSignalsEmpty: (v) => setP((s) => ({ ...s, signalsEmpty: v })),
    setAgentPanel: (v) => setP((s) => ({ ...s, agentPanel: v })),
    setTheme: (t) => setP((s) => ({ ...s, theme: t })),
    reset: () => { setP(seed()); setOpenListId(null); setFeed("ready"); },
    commandsOpen,
    setCommandsOpen,
    prefsOpen,
    setPrefsOpen,
    toasts,
    toast,
    dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
  }), [p, feed, openListId, commandsOpen, prefsOpen, toasts, toast]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function usePdb() {
  const s = useContext(Ctx);
  if (!s) throw new Error("usePdb outside PeopleDbProvider");
  return s;
}
