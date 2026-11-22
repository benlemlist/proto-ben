# Accounts list monitoring — Create signals from a company list

Route: `/companies` · code: `src/projects/accounts-monitoring/` · version switch + scenarios in the floating proto panel
Notion: [FEATURE-4869](https://app.notion.com/p/401dfb675ef480959cb5f0ced5c8843e) · Squad Data · Signals · Status Coding · Design not started (as of 2026-11-22)
Figma V1: [Signal-based prospection › Companies page](https://www.figma.com/design/TH4w8EquuoI963D4Ikfirx/Signal-based-prospection?node-id=6714-68937) (Maxime L)

## Context
Enterprise users doing Account-Based Sales think in accounts (Tier 1, Tier 2), not in signal types. Today a signal starts from the Signals page, one watch list per signal type, with the company list attached by hand. The opportunity adds an entry point in the CRM Companies view: lemAgent opens on the list, proposes relevant signals, and deploys the watch lists (`segmentType: 'list'`, never the whole segment).

## Two versions in the proto
The PM asked for feedback on Maxime L's first iteration. Both are in the proto, switch in the proto panel ("Accounts monitoring · version").

**V1 · Maxime L (Figma)**, reproduced as designed:
- 4 entry points: primary toolbar button, icon in the "Active signals" header, a "Monitor signals" chip in every empty cell, bulk action. Available on "All companies" too.
- lemAgent panel: "Loaded Signal agents skill", 4 suggested agents as radio cards (truncated names, same credits line on all), "Review signal agents" / "Setup manually".
- The flow stops there: review, deploy and the after-state are not designed (a toast says so).

**V2 · Ben**, the proposal:
- 2 entry points only (option C of the opportunity): toolbar "Monitor signals" next to "AI columns" on a CRM list (disabled on "All companies", with the reason), and the bulk action for a selection.
- One "Signals" column that separates **monitored** (radar + number of agents) from **received** (signal chips, "New"); hover card lists the agents and the latest signals. "Not monitored" when empty. "N of M monitored" next to the filters.
- lemAgent: scope chip always visible → short analysis of the accounts → suggestions with the why, a relevance score, companies covered, signals and credits per month → signals that can't watch a list yet shown locked → sticky total → Deploy in the chat → confirmation with the live agents and a link to Signals.
- Duplicates: companies already watched by an agent of the same signal are left out, and the agent says so.
- Edit an agent: side panel with the watch-list settings (name, identification limit, processing), scope locked to the list.
- Chat: "add cost cutting" adds an agent; a signal that can't watch a list is refused with the reason.

## Proto scenarios (panel)
- V2: Monitor "Tier 1 accounts" (starts the agent) · Next morning: first signals found (the deployed agents find signals, marked New) · Reset data.
- V1: Open the agent panel · Reset data.

## Status
Proto built 2026-11-22. To review with the PM (feedback asked on Maxime L's iteration), then Lucas (ABS) and Maxime.

## Key decisions
- 2026-11-22 — V1 is kept as designed, including its inconsistencies (radio for multi-select, "Lawsuits and legal issues" under "Firing & cost-cutting"), so the comparison is fair.
- 2026-11-22 — V2 never monitors "All companies": the toolbar button is disabled there with the reason; a selection becomes a list-based scope.
- 2026-11-22 — Fundraising, New hire and Competitor connections are shown locked ("can't watch a list yet"), per prerequisite #1 of the opportunity.
- 2026-11-22 — V2 edits an agent with the existing watch-list settings in a side panel instead of a new review modal.
- 2026-11-22 — Credits estimate = companies × expected signals per company per month × credits per signal (`rate` in `data.ts`), shown per agent and in total.
