# Specs — PeopleDB suggested lead lists

## Screen: People database (`/people-database`)
App sidebar collapsed on entry. Two columns:
- **lemAgent panel** (left, 360px, closable; reopened from the header "lemAgent" button).
- **PeopleDB** (right): header with "Unlocked this month 412 leads", credits, "Search with filters" (classic search, unchanged); the feed below on a grey background.

### Feed
Sections, each with a title, a subtitle and a "Manage preferences" link:
1. **Built for you**: ICP lists sorted by fit (max 5). Card: "Matches your ICP" badge · "96% ICP fit" · title · 1-line description · lead count · 4 avatars + "+N" · "Open list".
2. **Fresh from signals**: newest first. Card: color-coded signal badge · freshness ("3h ago", "Yesterday", "2 days ago"; a list delivered today shows a **New** badge + "Today" and a selected border) · same body. Last card: **Niche list · coming soon** ("Notify me").
3. Footer: "More signals coming soon": Funding, Company followers, Warm intros, Competitor mentions.

The whole card opens the list.

### States
- **Generating** (first open of an existing account, or a profile change): an AI InfoMessage ("lemAgent is building your first lists…") + skeleton cards in both sections, ~3s, then the feed.
- **No fresh signal today**: dashed empty block in the signals section with a hint to widen the ICP.

## Screen: Open list (`?list=<id>`)
- "← Suggested lists" back button, badge + meta, title, "N leads · description".
- Actions: **Export** and **Add N leads to a campaign** (primary).
- "Why this list" InfoMessage (info for ICP lists, AI for signal lists).
- **Criteria** chips, read-only, plus a disabled "Edit criteria" with a tooltip: comes in a later version.
- Lead table (first 40 rows + "Showing 40 of N"): Name/title, Company/industry, signal detail or "Why they match", Location, Headcount. Row checkboxes and select-all → BulkAction: Add to campaign, Save to contacts.

## Manage preferences (modal)
Company profile (from the context center) as chips + "Edit in context center"; switches for the 4 signal types. Save → toast "Signal lists update tomorrow morning."

## lemAgent panel
Empty state "Who do you want to reach?" + 3 example prompts + composer. Sending a prompt answers that niche lists are coming soon and links the 2 closest suggested lists (keyword match). Mock, no AI call.

## Proto commands (⌘⇧K, `window.proto.help()`)
- Company profile: **Cadencio** (sales software, default) or **Sentrail** (cloud security). Changing it regenerates the lists.
- First open (lists generating) · Next morning: new signals (adds a fresh signal list, ages the others by a day).
- No fresh signal today · lemAgent panel · Dark mode · Reset data.
