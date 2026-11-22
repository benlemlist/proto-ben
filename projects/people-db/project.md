# PeopleDB — Suggest lead lists instead of letting users search

Route: `/people-database` · code: `src/projects/people-db/` · proto commands: ⌘⇧K (or `?proto`, `?list=<id>`)
Notion: [FEATURE-5060](https://app.notion.com/p/414dfb675ef480f88aedf977a82c3205) · Squad Data · Status Next · Design not started (as of 2026-11-22)

## Context
PeopleDB opens on an empty search over 450M+ contacts. Building filters from scratch overwhelms most users, so adoption stays low relative to the data quality. Lead Finder already shows that agent-driven sourcing beats manual search. Competitors (Apollo, Clay, Ocean) ship suggested lists.

**Shift:** from "search for leads" to "receive curated lists matched to your business".

## Who
- **SDRs and AEs first**: packaged lists, no filter work.
- **RevOps / GTM engineers second**: see the criteria behind a list and check ICP fit. No criteria editing in V1.

## V1 scope
- **Built for you**: 3–5 ICP lists, ranked by % ICP fit. Generated at context center creation, or lazily on first PeopleDB open (loading state).
- **Fresh from signals**: updated daily. Hiring (green), Job change (blue), New tool and Upcoming renewal (yellow).
- **Open list**: pre-filtered PeopleDB view with the list's criteria.
- Free: no credit cost to open a list. No new data ingestion.
- **Coming soon**: niche lists (agent-built in 1–2h), funding, company followers, warm intros, competitor mentions.

## Status
v1 proto built 2026-11-22, from Maël's reference proto (screenshot in the Notion page). To review with the PM.

## Key decisions
- 2026-11-22 — Maël's "Funding" card dropped from the signals feed: funding is out of V1 (no data source). It's listed under "More signals coming soon".
- 2026-11-22 — Maël's "Build your own signal agent" card replaced by a "Niche list · coming soon" card (spec's third list type). Signal agents live in `/signals`.
- 2026-11-22 — "Open list" goes to a list view with read-only criteria chips (+ locked "Edit criteria") to serve RevOps without opening filter editing.
- 2026-11-22 — Classic filter search stays reachable from the header ("Search with filters").
- 2026-11-22 — Lists are rebuilt from `data.ts` on load; only the proto's "fresh" lists persist in localStorage.

## Open questions for the PM
- Where does the feed live when the user already has saved searches: above them, or a separate tab?
- Does "Add N leads to a campaign" from a list cost enrichment credits at launch, as for a normal PeopleDB import?
- How is "% ICP fit" explained to the user (tooltip with the matched dimensions)?
- Do signal lists keep yesterday's leads, or only the new ones of the day?
