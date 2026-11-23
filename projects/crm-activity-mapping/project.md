# CRM sync · Custom activity mapping (simplified)

- **PM**: Edouard · Notion: FEATURE-4018 « CRM sync - Custom activity mapping »
- **Edouard's proto**: https://proto-crm-custom-activity-mapping.vercel.app/settings/crm
- **This proto**: `/settings/crm` (`src/projects/crm-activity-mapping/`), Salesforce only.

## Why a simplified version
Edouard's spec splits one activity's setup over 3 places: Activities (where it lands), Field Mapping
(what goes inside, rows = ~50 lemlist fields) and Advanced settings › Default values (fixed values
such as Type = Call). Type can be set in two of them (his own open question).

## What changes
| Change | Problem it solves |
|---|---|
| Fixed values move into Field Mapping: each Salesforce field gets a lemlist field, a **Fixed value** or **A value per activity** | One place per object; Type set in one place only; no "Field mapping takes priority" rule to learn; Default values keeps records only |
| Rows = the Salesforce fields lemlist writes, + « Add a Salesforce field » | Admins coming from Salesloft think "my Task field X gets what?"; no list of ~50 mostly empty lemlist rows |
| Preview column, « Preview with » one activity | The admin sees what lands in Salesforce for an Email bounced, a Call… before saving |
| Fallback shown as a hint (« Activity name for 8 activities ») | Generic/specific sharing a field stays implicit, no extra setting |
| Activities tab unchanged (prod dropdown) | Rollout stays Salesforce-first, least effort |

## Proto panel
Team: new team (natural values) / existing team (today's `[lemlist] …` titles pre-selected), reset, link to Edouard's proto.
