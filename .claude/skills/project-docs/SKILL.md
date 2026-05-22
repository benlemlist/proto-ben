---
name: project-docs
description: Create and maintain the two project documentation files (project.md and specs.md) for any prototype built from this boilerplate. Use when starting a new project from the boilerplate, or when scope/features change and the docs need updating. Triggers — "new project", "init project docs", "update specs", "document this feature", or whenever a prototype's scope shifts.
---

# Project Docs — project.md & specs.md

Every prototype built from this boilerplate maintains **two living docs** at the repo root:

- **`project.md`** — the why and the what-now (context, goals, status, decisions)
- **`specs.md`** — the how (detailed feature specs)

Keep both up to date as the prototype evolves. They are living documents, not write-once.

## When to act

- **New project from boilerplate** → scaffold both files with the templates below, filling in what you know. Ask the user for anything missing rather than inventing it.
- **Scope/feature change** → update the relevant doc in the same turn you change the code. New feature → add a spec section. Changed behavior → edit the existing spec. Dropped feature → mark it removed.
- **User asks to document** → update the matching doc.

## project.md template

```markdown
# <Project Name>

## Context
What this prototype is, who it's for, and what problem/flow it explores. 1–3 paragraphs.

## Goals
- Primary goal (the thing this prototype must demonstrate)
- Secondary goals

## Non-goals
- Explicitly out of scope (so we don't scope-creep a prototype)

## Status
Current state — what's built, what's in progress, what's next.

## Key decisions
- <date> — decision + short rationale (link to specs.md section if relevant)

## Links
- Figma:
- Notion / PRD:
- Related Lemlist feature area:
```

## specs.md template

```markdown
# Specs — <Project Name>

> Detailed behavior specs. One section per feature/screen. Update whenever behavior changes.

## <Feature / Screen name>

**User story:** As a <role>, I want <goal> so that <benefit>.

**Behavior:**
- Step-by-step of how it works.

**UI states:** empty / loading / populated / error / success — what each looks like.

**Edge cases:**
- <case> → <expected handling>

**Data:** which `src/data/mock-dataset.js` exports it uses, if any.

**Components:** which lemDS components render it.
```

## Rules

- Both files live at the **repo root** (next to `CLAUDE.md`), committed to git.
- Don't fabricate goals or specs — if the user hasn't said, ask or leave a clear `TODO:`.
- Reference real data: when a feature uses mock data, name the exact export from `src/data/mock-dataset.js`.
- Reference real components: name the actual lemDS components (per `node_modules/@l3mpire/ui/USAGE.md`).
- Keep specs concrete and testable — describe observable behavior and states, not implementation internals.
