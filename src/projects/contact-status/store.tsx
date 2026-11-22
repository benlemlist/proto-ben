// State of the contact status proto: the saved config, the draft being edited (Save bar),
// the scenario, the simulator and proto settings. Persisted in localStorage.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SCENARIOS, SIM_CAMPAIGNS, type Config } from "./data";
import { newSim, type SimState } from "./logic";

const STORAGE_KEY = "contact-status-proto-v1";

export interface ToastItem { id: number; type: "info" | "success" | "alert" | "warning"; title: string; subtitle?: string }

interface Persisted {
  scenario: string;
  saved: Config;
  draft: Config;
  sim: SimState;
  theme: "light" | "dark";
}

const seed = (scenario = "brand_new"): Persisted => {
  const cfg = SCENARIOS.find((s) => s.id === scenario)!.config();
  return { scenario, saved: cfg, draft: structuredClone(cfg), sim: newSim(SIM_CAMPAIGNS[0]), theme: "light" };
};

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* private window */ }
  return seed();
}

interface Store extends Persisted {
  dirty: boolean;
  setDraft: (fn: (c: Config) => Config) => void;
  save: () => void;
  discard: () => void;
  loadScenario: (id: string) => void;
  setSim: (s: SimState) => void;
  resetSim: () => void;
  setTheme: (t: "light" | "dark") => void;
  reset: () => void;
  commandsOpen: boolean;
  setCommandsOpen: (v: boolean) => void;
  simOpen: boolean;
  setSimOpen: (v: boolean) => void;
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismissToast: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 1;

export function ContactStatusProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Persisted>(load);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
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
    dirty: JSON.stringify(p.saved) !== JSON.stringify(p.draft),
    setDraft: (fn) => setP((s) => ({ ...s, draft: fn(structuredClone(s.draft)) })),
    save: () => setP((s) => ({ ...s, saved: structuredClone(s.draft) })),
    discard: () => setP((s) => ({ ...s, draft: structuredClone(s.saved) })),
    loadScenario: (id) => setP((s) => ({ ...seed(id), theme: s.theme })),
    setSim: (sim) => setP((s) => ({ ...s, sim })),
    resetSim: () => setP((s) => ({ ...s, sim: newSim(SIM_CAMPAIGNS[0]) })),
    setTheme: (theme) => setP((s) => ({ ...s, theme })),
    reset: () => setP((s) => ({ ...seed(s.scenario), theme: s.theme })),
    commandsOpen, setCommandsOpen, simOpen, setSimOpen,
    toasts, toast, dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
  }), [p, commandsOpen, simOpen, toasts, toast]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCS() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useCS outside ContactStatusProvider");
  return s;
}
