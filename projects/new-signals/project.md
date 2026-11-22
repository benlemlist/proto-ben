# New signals — Rodz sprint + Ads engagement

Route: `/signals` · code: `src/projects/signals/` · proto commands: ⌘⇧K (or `?proto`, `?signal=aiAdoption`)

## Context
Etienne (PM Signals) shared 11 opportunities for new signals. Design goal: build them **on top of the signals already in prod**, the same wizard, the same building blocks, no new pattern unless needed.

| Signal | Notion | Status | Entity | Credits |
|---|---|---|---|---|
| Ads engagement | FEATURE-5118 | Next | Company | like Website visitors |
| Competitor customer care | FEATURE-5142 | Next | Contact | 100 |
| Tech displacement | FEATURE-5137 | Next | Company | 100 |
| AI adoption | FEATURE-5139 | Next | Company | 100 |
| Employee departure | FEATURE-5140 | Idea | Company | 100 |
| LinkedIn comeback (dormant poster) | FEATURE-5143 | Next | Contact | 50 |
| Event attendees | FEATURE-5144 | Next | Contact | 50 |
| Forecasted fundraising / IPO / acquisition / growth | FEATURE-5145 · 5146 · 5148 · 5150 | Next (growth: Idea) | Company | 100 |

## Source of truth: prod
Studied in `lempire/lemapp/imports/lemlist/watch-list` (sparse checkout in `~/Documents/lemlist/lempire-prod`):
- Wizard `watch-list-modal.tsx`: **Signal to detect** (search + 7 collapsible groups, cards with Company/Contact tag) → **Configure your signal** → **Scope** → **Signal processing** → **Summary** → "Deploy agent".
- Configure = "Agent configuration" (emoji + name) + one section per signal (`commons/signals/<signal>/*-form.tsx`).
- Scope = segment cards (all / list / csv per `WATCH_LIST_SEGMENT_TYPES_PER_INTENT`) + "Identification limit" (5 / 20 / 50 + slider, credits estimate) + "Filter criteria" (include/exclude industries, sizes, location).
- Signal processing = Manual / Auto-create tasks / Auto-push to campaign; company signals pushed to a campaign get the **sourcing persona** picker.
- Signal panel = "Signal details" fields (`WatchListEntitySignalBodyField`), company, contact, actions.

## Key decisions
- 2026-11-22 — Every new form reuses the form of its closest prod signal: Tech displacement / AI adoption ← Technology change · Competitor care / Event attendees ← Competitor connections (URL list one per line) · Employee departure / LinkedIn comeback ← New hire (job titles) · Ads engagement ← Website visitors · Forecasted × 4 ← no form (explainer only).
- 2026-11-22 — "Persona targeting" of the company signals = the **existing sourcing persona** of Signal processing, not new per-signal fields. Fixes the spec inconsistency (persona targeting listed on some signals only).
- 2026-11-22 — Forecast signals: an explainer on step 1 ("nothing to configure", what the prediction is based on) + heat score bar and "Why this company" list in the panel, to make the prediction trustworthy.
- 2026-11-22 — Ads engagement works without UTMs (click IDs); the UTM guide is an optional, collapsed section.
- 2026-11-22 — LinkedIn comeback: the spec's second limit (`dailyExtractLimit`) is merged into the identification limit — to validate.
- 2026-11-22 — Name "LinkedIn comeback" instead of "Dormant LinkedIn poster" (user-facing). To validate.

## Open questions for Etienne
1. Ads engagement: "no UTMs = no signal" acceptance criterion vs click-ID detection. Country filter in Scope?
2. Event attendees: the engagement fields (likes / comments / poster) look copied from a post signal — kept under "Advanced settings" with a warning badge.
3. Employee departure: `deliverPersonas` missing from the step 1 fields → proposed: handled by the sourcing persona.
4. Which new signals get list / CSV scope? Spec: only the 4 forecasts (Rodz watchlist endpoint).
5. AI adoption webhook example: ChatGPT Enterprise in category "CRM".
6. Statuses: Employee departure and Forecasted growth are still Idea.

## Status
v1 proto, to review with Etienne.
