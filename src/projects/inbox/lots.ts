// Delivery lots (see projects/inbox-q1-2027/priorities.md). Lots are cumulative:
// lot N shows every feature of lots 1..N. Lot 0 approximates production today.

export type Feature =
  // Lot 1 — trust
  | "privacy_hotfix" | "preview_latest" | "bubble_on_reply" | "snooze_wake" | "channel_icon"
  | "ooo_visible" | "composer_inline" | "draft_label"
  // Lot 2 — reply without Gmail
  | "recipients_edit" | "forward" | "attachments" | "schedule" | "lemcal"
  // Lot 3 — triage
  | "status_workflow" | "left_nav" | "interest_header" | "ai_suggest" | "filters" | "bulk" | "shortcuts"
  // Lot 4 — all messages
  | "all_messages" | "participants" | "threads" | "linkedin_events"
  // Lot 5 — team
  | "private" | "team_unread" | "notes"
  // Lot 6 — AI
  | "ai_summary" | "ai_reply" | "ai_next_step";

export const FEATURE_LOT: Record<Feature, number> = {
  privacy_hotfix: 1, preview_latest: 1, bubble_on_reply: 1, snooze_wake: 1, channel_icon: 1, ooo_visible: 1, composer_inline: 1, draft_label: 1,
  recipients_edit: 2, forward: 2, attachments: 2, schedule: 2, lemcal: 2,
  status_workflow: 3, left_nav: 3, interest_header: 3, ai_suggest: 3, filters: 3, bulk: 3, shortcuts: 3,
  all_messages: 4, participants: 4, threads: 4, linkedin_events: 4,
  private: 5, team_unread: 5, notes: 5,
  ai_summary: 6, ai_reply: 6, ai_next_step: 6,
};

export const LOTS: { lot: number; title: string; short: string }[] = [
  { lot: 0, title: "Production today", short: "Prod" },
  { lot: 1, title: "Lot 1 · I can trust my inbox", short: "Trust" },
  { lot: 2, title: "Lot 2 · I reply without Gmail", short: "Reply" },
  { lot: 3, title: "Lot 3 · I triage in one click", short: "Triage" },
  { lot: 4, title: "Lot 4 · Every conversation", short: "All messages" },
  { lot: 5, title: "Lot 5 · Team & privacy", short: "Team" },
  { lot: 6, title: "Lot 6 · AI in the flow", short: "AI" },
];

export const MAX_LOT = 6;
