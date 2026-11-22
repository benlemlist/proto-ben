// Rules engine: how a lead event moves a contact status. Pure functions, used by the
// "Try on a contact" simulator so the PM can test a mapping before saving it.
//
// Rules (Notion page + grooming notes 25/09, 28/09, 27/10):
// 1. An event moves the contact to the status its outcome is mapped to. Unmapped → no effect.
// 2. On the same lead, a contact never goes back down the lifecycle path.
//    The first event of a stage moves it, later events of the same stage change nothing
//    (no cascade of "last updated at").
// 3. An exit (Not interested, Do not contact…) applies whatever the stage.
//    From an exit, the same lead brings the contact back only with a stage above the
//    highest one it reached on that lead.
// 4. A new lead (the contact enters another campaign):
//    "latest" → starts over, its first event can move the contact back (Jan: not interested, Sep: contacted).
//    "highest" → the contact keeps the highest stage reached across every lead.
// 5. A change from the CRM or by hand wins: events of the same lead no longer override it.
//    The next lead resumes the mapping.

import type { Config, ContactStatus } from "./data";
import { OUTCOMES } from "./data";

export type Source = "event" | "crm" | "manual" | "new_lead";

export interface HistoryEntry {
  id: number;
  at: number; // simulated timestamp (ms)
  source: Source;
  leadIndex: number; // which lead (campaign) it happened on
  detail: string; // event label, "HubSpot", "Ben (manual)"…
  from: string | null;
  to: string | null;
  applied: boolean;
  reason?: string; // why it was ignored, or a note
}

export interface Lead {
  campaign: string;
  startedAt: number;
  peak: number; // highest path rank reached on this lead (-1 = none)
  lockedBy: "crm" | "manual" | null; // rule 5
}

export interface SimState {
  status: string | null;
  leads: Lead[];
  history: HistoryEntry[];
  clock: number;
}

let nextId = 1;

export const START = new Date("2026-01-12T09:14:00").getTime();
const HOUR = 3600_000;

export function newSim(campaign: string): SimState {
  return {
    status: null,
    clock: START,
    leads: [{ campaign, startedAt: START, peak: -1, lockedBy: null }],
    history: [],
  };
}

export const pathRank = (statuses: ContactStatus[], id: string | null) =>
  id ? statuses.filter((s) => s.column === "path").findIndex((s) => s.id === id) : -1;

const isExit = (statuses: ContactStatus[], id: string | null) => !!id && statuses.find((s) => s.id === id)?.column === "exit";

const nameOf = (statuses: ContactStatus[], id: string | null) => statuses.find((s) => s.id === id)?.name ?? "—";

function push(sim: SimState, e: Omit<HistoryEntry, "id" | "at" | "leadIndex">, advance = 3 * HOUR): SimState {
  const clock = sim.clock + advance;
  return { ...sim, clock, history: [{ id: nextId++, at: clock, leadIndex: sim.leads.length - 1, ...e }, ...sim.history] };
}

export function fireEvent(sim: SimState, cfg: Config, outcomeId: string, eventLabel?: string): SimState {
  const outcome = OUTCOMES.find((o) => o.id === outcomeId)!;
  const detail = eventLabel ?? outcome.events[0];
  const target = cfg.enabled ? cfg.mapping[outcomeId] ?? null : null;
  const lead = sim.leads[sim.leads.length - 1];
  const base = { source: "event" as const, detail, from: sim.status };

  if (!cfg.enabled) return push(sim, { ...base, to: sim.status, applied: false, reason: "Dynamic contact status is off: only lead status changes." });
  if (!target) {
    const reason = outcome.family === "contact" ? `“${outcome.label}” moves no contact status in your mapping.` : outcome.family === "team" ? "Describes the campaign, not the contact." : "A technical failure, not something the contact did.";
    return push(sim, { ...base, to: sim.status, applied: false, reason });
  }
  if (lead.lockedBy) {
    return push(sim, { ...base, to: sim.status, applied: false, reason: `Set ${lead.lockedBy === "crm" ? "by HubSpot" : "by hand"} on this campaign: events don't override it until the next campaign.` });
  }
  if (target === sim.status) return push(sim, { ...base, to: sim.status, applied: false, reason: "Already at this status." });

  const statuses = cfg.statuses;
  if (isExit(statuses, target)) {
    return push({ ...sim, status: target }, { ...base, to: target, applied: true, reason: "Exit: applies at any stage." });
  }

  const rank = pathRank(statuses, target);
  // "highest": the bar is the highest stage across every lead. "latest": only this lead's.
  const bar = cfg.newLeadRule === "highest" ? Math.max(...sim.leads.map((l) => l.peak)) : lead.peak;
  if (rank <= bar) {
    const path = statuses.filter((s) => s.column === "path");
    const reason = rank > lead.peak
      ? `The contact already reached ${nameOf(statuses, path[bar]?.id ?? null)} in an earlier campaign.`
      : isExit(statuses, sim.status)
        ? `Doesn't bring the contact back: it needs a stage above ${nameOf(statuses, path[lead.peak]?.id ?? null)}.`
        : "Never goes back on the same campaign.";
    return push(sim, { ...base, to: sim.status, applied: false, reason });
  }
  const leads = sim.leads.map((l, i) => (i === sim.leads.length - 1 ? { ...l, peak: rank } : l));
  const back = sim.leads.length > 1 && lead.peak === -1 && !!sim.status && (isExit(statuses, sim.status) || pathRank(statuses, sim.status) > rank);
  return push({ ...sim, status: target, leads }, { ...base, to: target, applied: true, reason: back ? "New campaign: the contact starts over." : undefined });
}

export function newLead(sim: SimState, campaign: string): SimState {
  const clock = sim.clock + 240 * 24 * HOUR; // ~8 months later
  const leads = [...sim.leads, { campaign, startedAt: clock, peak: -1, lockedBy: null }];
  return push({ ...sim, clock, leads }, { source: "new_lead", detail: campaign, from: sim.status, to: sim.status, applied: false, reason: "Added to a new campaign. The status stays until its first event." }, 0);
}

export function setFromOutside(sim: SimState, cfg: Config, by: "crm" | "manual", statusId: string): SimState {
  const statuses = cfg.statuses;
  const leads = sim.leads.map((l, i) => (i === sim.leads.length - 1 ? { ...l, lockedBy: by, peak: Math.max(l.peak, pathRank(statuses, statusId)) } : l));
  return push(
    { ...sim, status: statusId, leads },
    { source: by, detail: by === "crm" ? "HubSpot" : "Adrien Donot", from: sim.status, to: statusId, applied: true, reason: "Events of this campaign won't override it." },
    26 * HOUR,
  );
}

export function fmtDate(ms: number) {
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
