// State of the Signals proto: agents, signals, the "Deploy new agent" wizard, proto settings. Persisted in localStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_CONFIG, DAILY_LIMIT, emptyFilters, signalType, type Agent, type Signal, type SignalStatus } from "./data";
import { makeSignals } from "./logic";

const STORAGE_KEY = "signals-proto-v1";

export interface ToastItem { id: number; type: "info" | "success" | "alert" | "warning"; title: string; subtitle?: string }

/** Wizard: step -1 = "Signal to detect" picker, then 0..3 = WIZARD_STEPS. */
export interface Wizard { step: number; draft: Agent; editId?: string }

interface Persisted {
  agents: Agent[];
  signals: Signal[];
  trackingInstalled: boolean;
  newOnly: boolean;
  theme: "light" | "dark";
}

const now = () => new Date().toISOString();

export function newDraft(type = ""): Agent {
  return {
    id: `a${Date.now()}`,
    name: "",
    emoji: ["🚀", "🎯", "🔥", "📡", "🧲", "⚡️"][Math.floor(Math.random() * 6)],
    type,
    status: "draft",
    config: structuredClone(DEFAULT_CONFIG[type] ?? {}),
    segmentType: "all",
    crmListIds: [],
    filters: emptyFilters(),
    dailyLimit: DAILY_LIMIT.default,
    processing: "manual",
    createdAt: now(),
    ownerId: "u1",
  };
}

function seed(): Persisted {
  const mk = (p: Partial<Agent> & { id: string; type: string; name: string; emoji: string }): Agent => ({ ...newDraft(p.type), status: "live", ...p });
  const agents: Agent[] = [
    mk({ id: "a1", type: "companyRaisedFunds", name: "Fundraising — SaaS EMEA", emoji: "💰", processing: "campaign", personaId: "p1", campaign: "Fundraising follow-up",
      filters: { ...emptyFilters(), industries: { in: ["Software Development"], out: [] }, locations: { in: ["France", "Germany", "Spain"], out: [] } } }),
    mk({ id: "a2", type: "techDisplacement", name: "Leaving Outreach or Salesloft", emoji: "🔁", config: { trackBy: "tool", tools: ["Outreach", "Salesloft"], categories: [] }, processing: "task" }),
    mk({ id: "a3", type: "forecastedFunding", name: "Pre-round radar — Tier 1", emoji: "🔮", segmentType: "list", crmListIds: ["l1"] }),
    mk({ id: "a4", type: "adsEngagement", name: "LinkedIn Ads → pricing page", emoji: "📣", config: { website: "lemlist.com", adPlatforms: ["linkedin", "google"], pagesTracked: "/pricing\n/signals", minDuration: "30", minPages: "2" } }),
    mk({ id: "a5", type: "competitorCustomerCare", name: "Talking to Apollo support", emoji: "🎧", status: "paused",
      config: { companyUrls: ["https://www.linkedin.com/company/apolloio"], profileUrls: [], trackedRoles: ["customer_success", "support"] } }),
  ];
  const signals = agents.filter((a) => a.status === "live").flatMap((a) => makeSignals(a, a.type === "forecastedFunding" ? 6 : 5));
  return { agents, signals, trackingInstalled: true, newOnly: false, theme: "light" };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* private window */ }
  return seed();
}

interface Store extends Persisted {
  wizard: Wizard | null;
  openWizard: (editId?: string) => void;
  closeWizard: () => void;
  setStep: (step: number) => void;
  setDraft: (fn: (a: Agent) => Agent) => void;
  pickType: (type: string) => void;
  deploy: () => void;
  setAgentStatus: (id: string, status: Agent["status"]) => void;
  removeAgent: (id: string) => void;
  setSignalStatus: (id: string, status: SignalStatus) => void;
  deliverSignals: (agentId?: string) => void;
  panelId: string | null;
  setPanelId: (id: string | null) => void;
  tab: "signals" | "agents";
  setTab: (t: "signals" | "agents") => void;
  setTracking: (v: boolean) => void;
  setNewOnly: (v: boolean) => void;
  setTheme: (t: "light" | "dark") => void;
  reset: () => void;
  commandsOpen: boolean;
  setCommandsOpen: (v: boolean) => void;
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 1;

export function SignalsProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Persisted>(load);
  const [wizard, setWizard] = useState<Wizard | null>(null);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [tab, setTab] = useState<"signals" | "agents">("signals");
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  }, [p]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", p.theme);
    return () => document.documentElement.removeAttribute("data-theme");
  }, [p.theme]);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = toastId++;
    setToasts((ts) => [...ts, { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5000);
  }, []);

  const store = useMemo<Store>(() => ({
    ...p,
    wizard,
    openWizard: (editId) => {
      const existing = editId ? p.agents.find((a) => a.id === editId) : undefined;
      setWizard(existing ? { step: 0, draft: structuredClone(existing), editId } : { step: -1, draft: newDraft() });
    },
    closeWizard: () => setWizard(null),
    setStep: (step) => setWizard((w) => (w ? { ...w, step } : w)),
    setDraft: (fn) => setWizard((w) => (w ? { ...w, draft: fn(structuredClone(w.draft)) } : w)),
    pickType: (type) => setWizard((w) => (w ? { ...w, draft: { ...newDraft(type), emoji: w.draft.emoji, name: w.draft.type === type ? w.draft.name : "" } } : w)),
    deploy: () => {
      if (!wizard) return;
      const agent: Agent = { ...wizard.draft, status: "live" };
      setP((s) => ({ ...s, agents: wizard.editId ? s.agents.map((a) => (a.id === agent.id ? agent : a)) : [agent, ...s.agents] }));
      setWizard(null);
      setTab("agents");
      toast(wizard.editId
        ? { type: "success", title: "Agent updated successfully", subtitle: "Agent reconfigured. Next signals will reflect the updated scope." }
        : { type: "success", title: "Agent deployed successfully", subtitle: "Your agent is now active. First signals will be delivered within 24 hours." });
    },
    setAgentStatus: (id, status) => setP((s) => ({ ...s, agents: s.agents.map((a) => (a.id === id ? { ...a, status } : a)) })),
    removeAgent: (id) => setP((s) => ({ ...s, agents: s.agents.filter((a) => a.id !== id), signals: s.signals.filter((x) => x.agentId !== id) })),
    setSignalStatus: (id, status) => setP((s) => ({ ...s, signals: s.signals.map((x) => (x.id === id ? { ...x, status } : x)) })),
    deliverSignals: (agentId) => {
      setP((s) => {
        const targets = s.agents.filter((a) => a.status === "live" && (!agentId || a.id === agentId));
        const fresh = targets.flatMap((a) => makeSignals(a, Math.min(3, a.dailyLimit), 0));
        return { ...s, signals: [...fresh, ...s.signals] };
      });
      setTab("signals");
      toast({ type: "info", title: "New signals delivered", subtitle: "Proto: generated for every live agent." });
    },
    panelId,
    setPanelId,
    tab,
    setTab,
    setTracking: (v) => setP((s) => ({ ...s, trackingInstalled: v })),
    setNewOnly: (v) => setP((s) => ({ ...s, newOnly: v })),
    setTheme: (t) => setP((s) => ({ ...s, theme: t })),
    reset: () => { setP(seed()); setWizard(null); setPanelId(null); },
    commandsOpen,
    setCommandsOpen,
    toasts,
    toast,
    dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
  }), [p, wizard, panelId, tab, commandsOpen, toasts, toast]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useSig() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSig outside SignalsProvider");
  return s;
}

export const typeOf = (a: Agent) => signalType(a.type);
