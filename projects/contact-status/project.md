# Dynamic contact status based on lead status

- **Notion:** [FEATURE-1804](https://app.notion.com/p/264dfb675ef480ea8c2ecd93a3059e17) · squad CRM · release planned 2026-12-15
- **Route:** `/settings/data-management/statuses` (or user menu › Settings)
- **Code:** `src/projects/contact-status/`
- **Figma:** lemcrm › « Layout 2 - Simplified » (`B5x33axTli7o5u8hH4FT7f`, node 10158-14028)
- **Earlier proto (PM):** https://proto-contact-lifecycle.vercel.app/settings/lifecycle-stage

## Problem
Contact status is static: only a person, CSV, API or the CRM changes it. A lead can be "interested" while the contact is still "open", so ops build and maintain a CRM workflow to copy lead status into contact status.

## In scope
- Map lead events (80 events grouped into 15 outcomes) to contact statuses, n:1.
- Contact statuses ordered cold → hot (lifecycle path), plus exits, plus statuses kept out of the lifecycle.
- A lead status reached moves the contact status automatically. Same lead never moves it back; a new lead can.
- The CRM (or a person) can overwrite it; then the mapping stops applying for that lead.
- Property history: why the contact status changed.

## Out of scope
- Picklist sync of values with the CRM (separate feature, shown here only as "Sync with CRM").
- Account status and deal status (same logic, next step).

## Decisions made in the proto (to validate with the PM)
- 2026-11-22: "Never moves a contact" outcomes (task ignored, step skipped, step failed, nothing to act on) are locked to "No effect".
- 2026-11-22: a third zone "Not in the lifecycle" answers the 27/10 note (a status must be able to leave the mapping).
- 2026-11-22: "last vs max" (grooming 25/09) is a setting, "A new campaign can move a contact back", on by default (latest campaign wins).
- 2026-11-22: a CRM or manual change locks the contact status for the rest of that campaign; the next campaign resumes the mapping.
- 2026-11-22: saving offers the 3 options of the 28/09 grooming: only from now on / recalculate / recalculate and push to the CRM.
- 2026-11-23: aligned with prod (lemcrm-status-modal.tsx): a status some contacts use can't be deleted, same wording ("Life cycle cannot be removed because some contacts are using it").
- 2026-11-23: settings open in the prod full-screen modal (settings navbar + Data management tabs), Statuses is a new tab.
- 2026-11-22: when an exit is reached, the same campaign brings the contact back only with a stage above the highest one it reached.

## Open questions for Monday
- Out-of-campaign actions (a call from the contact panel): attach them to the latest lead?
- A contact in two campaigns at once (outreach + webinar): last or max? The setting lets us test both.
- Uniqueness rules (PM's "Duplicate rules" artifact) decide who "the same contact" is: what happens to the status and its history when two contacts merge, or when a person becomes a new contact after changing company?
- "Suggest a setup" on an existing team with no exit statuses: should it also suggest creating Not interested / Do not contact?
- Apollo's "Do not override with event triggers if contact is manually set to this stage": per status, or global like here?
- Today, prod manages contact statuses from the status picker ("Edit contact statuses" → small "Manage your contact statuses" modal), not in Settings. The new Settings tab is a second place for the same list: keep both in sync, or make Settings the reference and point "Edit contact statuses" to it?
- Prod statuses already have an order (drag and drop in that modal). Should that order be the lifecycle path, instead of a second order in Settings?
