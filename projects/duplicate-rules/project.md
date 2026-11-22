# Duplicate rules — simplification

**PM:** Edouard · **Route:** `/settings/data-management/duplicates` · **Code:** `src/projects/duplicate-rules/`
**Source:** Edouard's artifact "Duplicate rules modal" (https://claude.ai/artifact/LvnY3FUeKCvk68p8YPQvVX), deliberately verbose so the rules are exact. Goal: make it simpler without losing precision.

## Context
The Duplicate rules modal decides when a new record is "the same" as an existing one, in which case lemlist updates it instead of creating a duplicate.
- **Contacts**: matched on email, LinkedIn URL, Sales Navigator URL. One option: allow LinkedIn / Sales Navigator duplicates (contacts with different emails stay separate).
- **Companies**: matched on name + domain (or domain only), LinkedIn URL, Sales Navigator URL. Three options: clean company name, match only on domain (these two exclude each other), allow LinkedIn / Sales Navigator duplicates.
- **Defaults**: existing teams keep today's behavior plus clean name. New teams: LinkedIn duplicates allowed, companies matched on domain only.

## What the simplified version changes
1. **Two mutually exclusive switches become one choice.** "Clean company name" and "Match only on domain" answer the same question (what makes two companies the same?). They become a radio: *The same domain* / *The same domain and name*. No more disabled state and tooltips.
2. **The name is always cleaned when it counts.** The "domain + name, uncleaned" combination disappears.
3. **Positive wording.** "Allow LinkedIn duplicates" becomes "Also match on LinkedIn profile / page". LinkedIn and Sales Navigator are one criterion.
4. **The key that always matches is stated once**: "Contacts with the same email are always the same contact."
5. **One example block per object**, rewritten from the current choices, instead of one example per switch.
6. **The tab sums the rules up in one line per object** ("Same email or same LinkedIn profile", "Same domain, or same LinkedIn page"), with an "Edit rules" button.

The same rule model (`rules.ts`) drives both modals, so switching between them in the proto keeps the configuration.

## Proto commands (floating proto panel)
- **Modal version**: Simplified / Original (Edouard), Edouard's modal rebuilt in lemDS with his wording and states.
- **Default rules of**: an existing team / a new team.
- **Open the modal**.

## Open questions for Edouard
- Can we drop the "domain + name, not cleaned" combination, i.e. is cleaning always wanted when the name counts?
- Contacts: is the email the only key that can't be turned off? What happens to a contact without an email (LinkedIn only)?
- When the rules change, do they apply only to new records, or does lemlist re-check existing ones (merge)?
- Link with Dynamic contact status: when Theresa becomes a new contact she starts again from "New"; when two records merge, which status is kept? (also in `projects/contact-status/project.md`)

## Status
- 2026-11-22: v1 built (simplified modal + original for comparison). To review with Edouard on Monday. Not committed yet.
