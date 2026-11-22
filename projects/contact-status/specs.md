# Specs — Dynamic contact status

## Screen: Settings › Data management › Statuses › Contact status
1. **Object cards**: Contact status (designed), Account status and Deal status (empty states).
2. **Contact lifecycle**
   - Lifecycle path: ordered list, drag to reorder, number = stage, "N mapped" = outcomes pointing to it.
   - Exits: contacts who drop out; apply at any stage.
   - Not in the lifecycle: never set by events, still available by hand / CSV / API / CRM. Moving a status here clears its mappings.
   - Each status: edit (name + 15 colors), delete (confirm, mappings go to No effect), ··· menu to move between zones.
   - Sync with CRM: pick a HubSpot picklist (Lead status, Lifecycle stage). Values replace lemlist's and are locked (rename/delete in HubSpot). Events are re-mapped.
   - Team not set up yet: info message + "Suggest a setup" (places statuses, maps events; the team reviews).
   - Setting "A new campaign can move a contact back" (latest vs highest).
3. **Events**
   - "Moves a contact" (11 outcomes, 52 events): one contact status or No effect per outcome. Chips show events, +N with tooltip.
   - "Never moves a contact" (4 outcomes, 28 events): locked to No effect, with the reason in a tooltip.
   - Auto-map events: closest status per outcome (CRM mapping when synced).
4. **Save bar** (any change): Discard / Try on a contact / Save → modal: only from now on, recalculate existing contacts, recalculate and update HubSpot (needs CRM sync; warns that workflows fire). Turning the feature off: confirmation only.

## Try on a contact (side panel)
Fires events on Theresa Webb with the draft mapping: 11 contact outcomes, team/lemlist events, add to a new campaign, HubSpot changes it, set by hand. Shows the current status (stage n of N, exit), the current campaign, and the **contact status history**: from → to, source (lead event / HubSpot / manual / new campaign), campaign, why an event was ignored. "Show ignored events" toggle.

### Rules (`logic.ts`)
1. Event → mapped status; unmapped → no effect.
2. Same lead never moves back down the path; the first event of a stage moves it, later ones don't.
3. Exit applies at any stage; from an exit, the same lead comes back only above its highest stage.
4. New lead: latest (starts over) or highest (keeps the max across leads).
5. CRM / manual change wins for the rest of that lead.

## Proto commands (⌘⇧K, `?proto`, `window.proto`)
Teams: brand new (lemlist defaults), existing today (6 manual statuses), synced with HubSpot. `?scenario=hubspot`. Dark mode, reset, open the simulator.
