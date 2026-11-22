# Ben proto

One prototype for all of Benjamin's projects, built from Peter's [boilerplate](https://github.com/l3mpire/boilerplate-product-design). Each project adds its pages under `src/projects/<project>/` and its docs under `projects/<project>/`.

## Context
lemlist product design prototypes (React + Vite + lemDS). The boilerplate's components come first; the proto grows project after project.

## Projects

| Project | Route | Docs | Status |
|---|---|---|---|
| Accounts list monitoring — signals from a company list (FEATURE-4869) | `/companies` | [project](projects/accounts-monitoring/project.md) | V1 (Maxime L) vs V2 (Ben), switch in the proto panel, to review with the PM |
| PeopleDB — suggested lead lists (FEATURE-5060) | `/people-database` | [project](projects/people-db/project.md) · [specs](projects/people-db/specs.md) | v1, to review with the PM |
| Duplicate rules — simplification | `/settings/data-management/duplicates` | [project](projects/duplicate-rules/project.md) | v1, to review with Edouard on Monday |
| Dynamic contact status (FEATURE-1804) | `/settings/data-management/statuses` | [project](projects/contact-status/project.md) · [specs](projects/contact-status/specs.md) | v1, to review with the PM on Monday |
| New signals — Rodz sprint + Ads engagement | `/signals` | [project](projects/new-signals/project.md) · [specs](projects/new-signals/specs.md) | v1, to review with Etienne |
| Inbox — Q1 2027 focus | `/inbox` | [project](projects/inbox-q1-2027/project.md) · [specs](projects/inbox-q1-2027/specs.md) · [priorities by lot](projects/inbox-q1-2027/priorities.md) | v1, to review with the PM |

## Repositories
- `origin` → `l3mpire/proto-ben` (devs read it without being added as contributors)
- `perso` → `benlemlist/proto-ben` (Vercel deploys from it)
- `boilerplate` → `l3mpire/boilerplate-product-design` (pull Peter's updates: `git pull boilerplate main`)

**Every push goes to both `origin` and `perso`:** `git push origin main && git push perso main` (or `pnpm push:all`).

## Key decisions
- 2026-11-20 — Keep the boilerplate's history and a `boilerplate` remote, so lemDS and stack updates can be merged instead of copied.
- 2026-11-20 — One folder per project (`src/projects/<name>`, `projects/<name>`), routes wired in `src/main.tsx`.

## Links
- Boilerplate: https://github.com/l3mpire/boilerplate-product-design
