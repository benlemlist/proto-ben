# Specs — Dynamic contact status

## Screen: Settings › Data management › Statuses › Contact status
Settings open in the prod full-screen modal (settings navbar, Data management tabs; Statuses is new).
1. **Object cards**: Contact status (designed), Account status and Deal status (empty states).
2. **Feature switch** "Move contact status with lead status", above everything it drives.
   - Off (every team today): the statuses card is a plain list and the Events card is hidden.
   - On, for a team that never set it up: statuses are placed and events mapped for it ("We set it up for you" toast); the team reviews, then saves.
   - Turning it off: the save asks for confirmation.
3. **Statuses card**
   - Off → **Contact statuses**: one ordered list, as in prod's "Manage your contact statuses" modal. Drag to reorder, Add status, ··· menu (Edit, Delete).
   - On → **Contact lifecycle**:
     - Lifecycle path: ordered list, drag to reorder, number = stage, "N mapped" (hover lists the event groups and their events).
     - Exits: contacts who drop out; apply at any stage.
     - Not in the lifecycle: never set by events, still available by hand / CSV / API / CRM. Moving a status here clears its mappings. No Add status: a status lands here by being moved out.
     - ··· menu per status: Edit, Move to <zone>, Delete.
   - Delete: blocked when contacts use the status (same rule as prod, "Used by N contacts"); otherwise a confirmation, mappings go to No effect.
   - Sync with CRM: pick a HubSpot picklist (Lead status, Lifecycle stage). Values replace lemlist's and are locked (rename/delete in HubSpot). Events are re-mapped.
4. **When a contact joins a new campaign** (feature on only), its own card between the lifecycle and Events. Description: within a campaign, a contact only moves forward. Two radio cards side by side, each with an example: Start over (latest campaign wins) / Keep the highest stage.
5. **Events** (feature on only)
   - "Moves a contact" (11 outcomes, 52 events): one contact status or No effect per outcome. Every event is shown as a chip.
   - "Never moves a contact" (4 outcomes, 28 events): folded by default ("Show the 4 event groups…"); locked to No effect, with the reason in a tooltip.
   - Auto-map events: closest status per outcome (CRM mapping when synced).
6. **Save bar** (any change): Discard / Try on a contact / Save → modal: only from now on, recalculate existing contacts, recalculate and update HubSpot (needs CRM sync; warns that workflows fire). Turning the feature off: confirmation only.

## Try on a contact (side panel)
Titled like the button. Three sections, on a test contact (Theresa Webb) with the draft setup:
1. **The contact** (box): name, role, contact status (stage n of N, exit, "Set by HubSpot / by hand"), current campaign. "Unsaved setup" badge when testing unsaved changes.
2. **Simulate what happens to Theresa** (box):
   - A campaign event: one row per status (lifecycle order, then exits, then No effect), with the events that lead to it. The row of the current status is highlighted.
   - Something outside the campaign: add to a new campaign, HubSpot changes it, set by hand.
3. **Contact status history** (not boxed): from → to, source (lead event / HubSpot / manual / new campaign), campaign, why an event was ignored. "Show ignored events" toggle.

### Rules (`logic.ts`)
1. Event → mapped status; unmapped → no effect.
2. Same lead never moves back down the path; the first event of a stage moves it, later ones don't.
3. Exit applies at any stage; from an exit, the same lead comes back only above its highest stage.
4. New lead: latest (starts over) or highest (keeps the max across leads).
5. CRM / manual change wins for the rest of that lead.

## Proto commands (⌘⇧K, `?proto`, `window.proto`)
Teams: brand new (lemlist defaults), existing today (6 manual statuses), synced with HubSpot. `?scenario=hubspot`. Dark mode, reset, open the simulator.
