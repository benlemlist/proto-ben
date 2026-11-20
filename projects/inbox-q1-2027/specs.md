# Specs — Inbox Q1 2027

> Behavior of the proto at `/inbox`. Code: `src/projects/inbox/`. Each section says which lot brings it (`lots.ts`).
> Data: `src/projects/inbox/data.ts` (Fieldbase, a fictional field-ops SaaS using lemlist; signed in as Alice Martin, SDR).

## Layout

**User story:** As a sales rep, I want to see what needs me, read the whole conversation and reply, without leaving lemlist.

- App sidebar collapsed on `/inbox` (expandable), then: inbox navigation (lot 3) · conversation list · conversation + composer · contact panel (toggle).
- Lot 0–2: no inbox navigation, views in a dropdown in the list header (production: My conversations, Unread, Favorites, Snoozed, Archived, Sent only, Untracked).

**Components:** `SidebarSection`, `SidebarItem`, `SearchBar`, `DropdownMenu*`, `ObjectPanelHeader`, `Tabs`, `InfoMessage`, `Toast`.

## Navigation (lot 3)

- **Inbox** = my open conversations. **To classify** = open, with a reply, interest not set. **Unread**, **Favorites**.
- **Status**: Waiting for reply · Snoozed · Done (no badge).
- **All messages** (lot 4): Not a contact yet.
- **Channels**: Email, LinkedIn, WhatsApp, SMS, Call (my active conversations on that channel).
- **Team**: All team, then one item per teammate (their active conversations).
- **Views**: saved views (tags Hot deal, Pricing asked, Referral).
- Badge = number of **unread** conversations in the view.

**Edge cases:** private conversations of a teammate never count (lot 1); "Not a contact yet" is private to the owner.

## Conversation list

- Sorted by latest message (lot 1; prod: last reply, OOO ignored), grouped by day.
- Row: avatar with channel badge (lot 1), name, role · company, time, unread dot, preview of the **latest** message with "You:" when it's ours (lot 1; prod: last reply), badges: Not a contact yet, Out of office · back Mon (lot 1), Snoozed until, interest, AI suggestion `Interested? 74%` (lot 3), tags, owner when not mine, Scheduled.
- Hover actions: mark read/unread, favorite, snooze until tomorrow, Done (or Archive in lot 0–2).
- Lot 3: filter bar (Sender, Campaign, Channel, Interest, Unreplied), checkbox selection + bulk actions (Interested, Done, Snooze 1 week, Mark as read, Tag).

**UI states:** empty view → "Inbox zero" or "No conversations found".

## Conversation

- Header: name, role at company (`ObjectButton`), campaigns (`ObjectButton type="campaign"`), channel icons, read-only status (lot 3), Snooze menu, Done / Reopen, more menu (unread, favorite, tags), contact panel toggle.
- **Interest in one click** (lot 3): Interested / Not interested / Neutral, toggle back to none. Lot 0–2 show production's CRM "Contact Status" instead.
- Banners: production privacy bug (lot 0, teammate's private conversation), Not a contact yet (lot 4: Add as contact / Ignore / Never log), AI summary (lot 6), AI suggestion with confidence + Confirm / Change (lot 3), "Marked by AI · Undo" (lot 3), next step (lot 6).
- Channel tabs + email thread picker (lot 4) when several channels or threads.
- Timeline, every channel merged: email cards (collapsed header, To / CC on open, attachments, source line), chat bubbles (LinkedIn, WhatsApp, SMS), call card with AI summary, LinkedIn invitation note and acceptance (lot 4), out of office collapsed into one line, "X forwarded your email to Y" (not a reply), "X added Y to this conversation", internal notes (lot 5), scheduled messages (dashed).
- Source of each message (lot 4): Campaign + step, Sent from lemlist, Sent from Gmail, Logged from LinkedIn / WhatsApp.

## Composer

- Lot 0: over the conversation (production). Lot 1: in the flow, collapsed by default to "Reply to Marc…", opened by Reply / Reply all / Forward or a draft; "Draft saved · 10:42".
- Channel picker (channels the contact can be reached on).
- Email: To (lot 2: any address), Cc, Bcc (lot 2), subject. Reply all pre-fills CC from the replied message.
- Toolbar: attach (lot 2, demo files), Templates (inserted at the cursor, no scroll jump), lemcal link (lot 2), Suggest a reply (lot 6, streamed, mock without key), Schedule send (lot 2), Send.
- Tab "Internal note" (lot 5).
- After sending: status → Waiting for reply (lot 3), toast.

## Workflow and status (lot 3)

- Open → (send) → Waiting → (reply) → Open. Snooze → Snoozed → (date or any reply) → Open. Done → (reply) → Open.
- Out of office (lot 1): snoozed until the return date, badge on the row, toast with the rule. Production: OOO changes nothing on the row.
- A reply wakes a snoozed conversation for everyone (lot 1). Production: stays snoozed in this proto's lot 0.

## AI (lots 3 and 6)

- Every new reply is classified (DeepSeek through `src/lib/ai`, mock classifier without a key): interest, confidence, reason.
- ≥ 90%: applied by AI, with Undo. Below: suggestion, view **To classify**.
- Summary on demand, suggested reply (human sends), next step (referral → add to campaign, meeting → lemcal, pricing → template, "later" → snooze).

## Not a contact yet (lot 4)

- Messages from people who are not contacts (inbound LinkedIn, email, WhatsApp) land in a private list.
- Add as contact → becomes a normal conversation. Ignore → hidden. Never log → removed and added to the never-log list.

## Team and privacy (lots 1 and 5)

- Lot 1 hotfix: a teammate's private conversation is not visible. Lot 0 shows it with a red banner (production bug).
- Lot 5: lock on private conversations, "Thomas · unread" on rows of a teammate who has not read the reply, notes.

## Proto commands (hidden)

- `⌘⇧K` / `Ctrl+Shift+K`, `?proto` in the URL, or `window.proto.help()` in the console.
- Delivery lot (0–6, also `?lot=3`), simulate incoming (reply, negative, ambiguous FR, OOO, CC / colleague, LinkedIn, WhatsApp, inbound not-a-contact, snoozed gets a reply), sign in as a teammate, jump to a scenario, dark mode, desktop notifications, contact panel, reset data.
- State is saved in localStorage (`inbox-q1-2027-proto-v1`).

## Scenarios in the data (one per feedback theme)

| Conversation | Shows |
|---|---|
| Marc Dupuis (DataSync) | CC added by the contact → Reply all, participant |
| Julie Moreau / Karim Benali (Stackly) | Forwarded internally, reply from another address |
| Anna Schmidt (Gridbase) | Out of office, auto-snoozed |
| Tom Richards (ClearPath) | Snoozed, came back with a reply |
| Léa Garnier (Velocity.io) | French reply, AI unsure |
| David Chen (NovaTech) | AI wrong: "later" read as interested |
| Ryan Cooper (PivotGrid) | Not interested, high confidence |
| Nina Petrova, Omar Haddad | Not a contact yet (LinkedIn, email) |
| Hugo Lambert | WhatsApp outside campaign + XLSX |
| Samuel Ortiz | Thomas's private LinkedIn (privacy) |
| Claire Fontaine (Synapse Labs) | Email + LinkedIn + call, one contact, note |
| Ben Walker | Lucas's reply, unread by the team |
| Sofia Russo | Draft kept |
| Lars Eriksson | Scheduled reply |
| Mia Wong | Logged from Gmail, no campaign |
| Paul Girard | Referral to a colleague |
| Yuki Tanaka | Two threads, one conversation |
| Jake Morrison | SMS |
| Eva Novak | Thomas's conversation (team view) |

## DS gaps found
- No icons for WhatsApp, SMS, reply, reply all, forward, paperclip, user-plus, ban, note in `@l3mpire/icons` (declared locally in `src/projects/inbox/icons.ts`, same format).
- No borderless rich-text composer field: the proto uses a plain textarea styled with tokens.
- `SidebarItem` badges are always the red notification style; a neutral count would fit views better.
