# New signals — specs (proto v1)

## Entry points
- `/signals` → tabs **Signals** (table: company, signal + label, contact, agent, status, created) and **Agents** (agent, signal type, status, scope, processing, signals past 30d, last signal, billing, ⋯ menu).
- "Deploy agent" → full-screen wizard. Clicking an agent row opens it in edit mode (step 1).

## Signal to detect
Prod picker, unchanged: search, 7 groups (Buyer intent, People moves, Company growth, CRM signal, Social activity, In-house events, Company news) with a count. New signals carry a **New** badge, come first in their group, and their group shows "N new" and starts open.
Placement: Buyer intent ← Ads engagement, Competitor customer care, Tech displacement, AI adoption · People moves ← Employee departure · Company growth ← 4 forecasts · Social activity ← LinkedIn comeback, Event attendees.

## Configure your signal (per signal)
| Signal | Section | Fields | Valid when |
|---|---|---|---|
| Forecast × 4 | How this signal works | none (AI info message + what the prediction uses) | name |
| Tech displacement | Technologies to monitor | Track by: specific tools / a tool category · Technologies or Categories (multi-select) | ≥1 value |
| AI adoption | AI tools to monitor | AI categories, AI tools (both optional, tools filtered by category) | name |
| Competitor customer care | Competitor to monitor | LinkedIn company URLs + profile URLs (one per line, 500 max in total, validated) · Teams to track (pills, default CS + Support) | ≥1 URL and ≥1 team |
| Event attendees | Events to monitor | LinkedIn event URLs (50 max) · Advanced: post engagers switch + types | ≥1 URL |
| Employee departure | Roles to monitor | Job titles (chips + suggestions) · info: delivers the company, persona in Signal processing | ≥1 title |
| LinkedIn comeback | People to monitor | Job titles · Silence before the comeback (30–365 days, default 75) | ≥1 title |
| Ads engagement | Ads engagement setup · Inclusion criteria · UTM setup guide (optional, closed) | Website (only sites with the script) · Ad platforms (empty = all) · Pages tracked · Min duration · Min pages | website |

Ads engagement without the tracking script: warning message + "Install the script", website select disabled.

## Scope
- Segment cards per signal: forecasts = all / company list / CSV (info: up to 1,000 companies); others = all segments only.
- Identification limit: everywhere except Ads engagement (like Website visitors). Default 20, slider 1–100, presets 5/20/50, custom up to 1,000, credits per day and per month.
- Filter criteria (all segments): industries, sizes, location (include / exclude); + contact job titles for contact signals.

## Signal processing
Prod: Manual / Auto-create tasks (owner) / Auto-push to campaign (Personas for company signals + AI-powered outreach or existing campaign).

## Summary
Signal to detect (with the signal's own settings), Scope, Signal processing, Billing → "Deploy agent" → toast "Agent deployed successfully".

## Signal panel
Header (company, domain, LinkedIn) · signal type + agent + time · **Signal details** from the Notion "Side panel data" · Contact (contact signals + employee departure) · Company · Ignore / Mark as handled / Add to campaign.
Forecasts: heat score bar + "Why this company" (AI analysis) + note that it is a prediction.

## Proto commands (⌘⇧K)
Show only the 11 new signals · tracking script on/off · open the wizard on any new signal · deliver signals now · dark mode · reset. `window.proto.help()`.
