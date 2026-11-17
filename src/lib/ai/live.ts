// The prototype's Live AI switch: one setting for every AI surface.
// On (the default): AI features call the real model through /api/agent
// (DeepSeek, the key on the server side). Off, or no key behind the proxy:
// every caller gets NoKeyError and falls back to its mock.
// A proto that wants the switch in its UI binds a lemDS Switch to
// useLiveAiSetting() / setLiveAi().

import { useSyncExternalStore } from "react";

/** What the proxy runs (vite-plugin-agent.ts / api/agent.ts). */
export const AI_MODEL_LABEL = "DeepSeek V4.1 Flash";

interface LiveAiState {
  on: boolean;
  /** The proxy answered "no key" (no OPENROUTER_API_KEY or DEEPSEEK_API_KEY): mocks until switched again. */
  unavailable: boolean;
}

const KEY = "proto-live-ai:v1";

function load(): LiveAiState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { on: true, ...(JSON.parse(raw) as Partial<LiveAiState>), unavailable: false };
  } catch {
    // storage unavailable: defaults
  }
  return { on: true, unavailable: false };
}

let state: LiveAiState = typeof window === "undefined" ? { on: true, unavailable: false } : load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function setLiveAi(on: boolean) {
  state = { on, unavailable: false };
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ on }));
  } catch {
    // private mode: kept for this visit
  }
  emit();
}

/** The proxy has no key: mocks until the setting is switched again. */
export function markAiUnavailable() {
  if (state.unavailable) return;
  state = { ...state, unavailable: true };
  emit();
}

/** Live right now (non-reactive): on, and not known to be without a key. */
export const liveAiOn = () => state.on && !state.unavailable;

export const useLiveAiSetting = () => useSyncExternalStore(subscribe, () => state.on);
export const useLiveAiUnavailable = () => useSyncExternalStore(subscribe, () => state.unavailable);
/** Live right now (reactive). */
export const useLiveAi = () => useSyncExternalStore(subscribe, () => state.on && !state.unavailable);
