# Inbox — Q1 2027 focus

## Context
The Inbox is where sales reps read replies, qualify prospects and create opportunities (3k users / week). It is one of the areas with the most feedback (97 items on the board, Oct 2025 → Nov 2026), and it is about to receive much more volume: FEATURE-3797 will log every message with a contact, on every channel, including messages sent outside lemlist.

This prototype explores the Q1 2027 vision asked by the PM (FEATURE-4991), starting from production (`l3mpire/lempire`, `lemapp/imports/lemlist/inbox/`) and from Maxime's exploration (`l3mpire/proto-inbox-old`, March 2026).

## Goals
- Users no longer need to go to Gmail to reply (To / CC / BCC, Reply all, Forward, attachments, schedule).
- Every message is logged, including people who are not contacts yet ("Not a contact yet").
- Keep multichannel and the merge at the contact level: one conversation = one contact, every channel, every source.
- Fix the most existing frustrations (trust in unread / preview / order / snooze, triage, privacy).
- Show the delivery plan: each lot can be shown alone in the proto, from "production today" (lot 0) to the full vision (lot 6).

## Non-goals
- Export of conversations, full-text search, import of past history.
- Backend feasibility (captured as constraints from FEATURE-3797 and the code audit, not solved here).
- Final visual polish: the proto uses lemDS components as they are.

## Status
- 2026-11-20 — v1 built: navigation, list, conversation (all channels), composer, contact panel, AI suggestions, "Not a contact yet", hidden proto commands, 7 lots. Realistic fake data (20 hand-written scenarios + 64 generated conversations).
- Next: review the lot split with the PM, then a review with Maxime, Calliste and Peter.

## Key decisions
- 2026-11-20 — **Lots are ordered trust → reply → triage → all messages → team → AI.** Fix what users can't rely on before adding volume. See [priorities.md](priorities.md).
- 2026-11-20 — **The privacy bug (teammates can read private LinkedIn conversations) is the first item of lot 1**, as a hotfix that can ship alone.
- 2026-11-20 — **Status is driven by actions** (from Maxime): Open → Waiting → Snoozed → Done; any inbound message brings it back to Open. "Done" replaces the team-wide "Archive".
- 2026-11-20 — **AI proposes, the human confirms.** AI sets the interest alone only at ≥ 90% confidence, with Undo. Below, a suggestion to confirm and a "To classify" view.
- 2026-11-20 — **Participants stay in the original conversation** (CC, colleague the contact forwarded to, other address), instead of production's separate auto-contact row.
- 2026-11-20 — **Out of office is visible but put away**: badge on the row, snoozed until the return date, wakes up on any reply.
- 2026-11-20 — Badges in the inbox navigation count **unread** conversations, not all of them.

## Links
- Notion opportunity: https://app.notion.com/p/40cdfb675ef481458aa6d6111bd1a392
- Inbox vision: https://app.notion.com/p/31edfb675ef480c595a7d85d090ef2e5
- All messages (FEATURE-3797): https://app.notion.com/p/3a3dfb675ef4800d9d9be4cef1875e69
- Figma (Inbox vision): https://www.figma.com/design/yhdBzOegE5LpQumJNIDC2K/Inbox
- Maxime's exploration: https://github.com/l3mpire/proto-inbox-old (deployed: https://lemlist-inbox-proto.vercel.app/inbox)
- Feedback board: https://cx-agents.vercel.app/voice-of-customer/product-feedback (area `inbox`, MCP `product-feedback`)
- Feature area: Inbox · Squad Productivity
