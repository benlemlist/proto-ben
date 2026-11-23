// Contact status driven by lead status (FEATURE-1804, squad CRM).
// Seed data: the 15 outcomes that group lemlist's 80 lead events, default statuses,
// CRM picklists and the proto scenarios.

import type { StatusPillType } from "@l3mpire/ui";

export type Column = "path" | "exit" | "unused";

export interface ContactStatus {
  id: string;
  name: string;
  color: StatusPillType;
  column: Column;
  /** Contacts at this status today (fake). Prod blocks deleting a status in use. */
  contacts?: number;
}

export type OutcomeFamily = "contact" | "team" | "lemlist";

export interface Outcome {
  id: string;
  label: string;
  description?: string;
  family: OutcomeFamily;
  events: string[];
}

// Every one of the 80 events (chawi.activityTypes) belongs to exactly one outcome.
export const OUTCOMES: Outcome[] = [
  // What the contact did: the only family that can move a contact status.
  { id: "to_contact", label: "To contact", description: "In the campaign, nothing sent yet.", family: "contact", events: ["To contact"] },
  {
    id: "first_touch", label: "First touch sent", description: "A step goes out, on any channel.", family: "contact",
    events: ["Email sent", "Sent", "LinkedIn invite sent", "InMail sent", "SMS sent", "Whatsapp message sent", "Whatsapp voice note sent", "LinkedIn voice message sent", "Manual task done", "API called", "Sparkled", "LinkedIn profile visited", "LinkedIn profile followed", "LinkedIn last post liked", "LinkedIn post commented", "LinkedIn skill endorsed", "LinkedIn invitation withdrawn", "AI variable generated"],
  },
  { id: "opened", label: "Opened", family: "contact", events: ["Opened (Email)", "Opened (LinkedIn)", "Whatsapp message seen", "Whatsapp voice note seen"] },
  { id: "clicked", label: "Clicked a link", family: "contact", events: ["Clicked", "Clicked (filtered link)"] },
  { id: "invite_accepted", label: "Invite accepted", family: "contact", events: ["LinkedIn invite accepted"] },
  { id: "replied", label: "Replied", family: "contact", events: ["Replied", "Replied from LinkedIn", "SMS replied", "Whatsapp message replied", "Whatsapp voice note replied"] },
  { id: "interested", label: "Marked interested", family: "contact", events: ["Interested (Call)", "Interested (Email)", "Interested (LinkedIn)", "Interested (Manual)", "Interested (API)"] },
  { id: "meeting_booked", label: "Meeting booked", family: "contact", events: ["Meeting booked"] },
  { id: "not_interested", label: "Marked not interested", family: "contact", events: ["Not interested (API)", "Not interested (Call)", "Not interested (Email)", "Not interested (LinkedIn)", "Not interested (Manual)"] },
  { id: "unsubscribed", label: "Unsubscribed", family: "contact", events: ["Unsubscribed", "Unsubscribed from API", "Manually unsubscribed", "Entity unsubscribed", "Variable unsubscribed"] },
  { id: "not_delivered", label: "Not delivered", description: "The address or the account refused the message.", family: "contact", events: ["Bounced", "Whatsapp message bounced", "Whatsapp voice note bounced", "LinkedIn voice message bounced", "SMS message failed"] },
  // What the team did: describes the campaign, not the contact.
  { id: "task_ignored", label: "Task ignored", family: "team", events: ["API ignored", "Call ignored", "Email task ignored", "LinkedIn task ignored", "Manual task ignored", "SMS ignored", "Whatsapp task ignored", "Whatsapp voice note ignored"] },
  { id: "step_skipped", label: "Step skipped", family: "team", events: ["Skipped", "Comment skipped", "Follow skipped", "Like skipped", "LinkedIn skill endorsement skipped", "Skipped (LinkedIn)", "Visit skipped"] },
  // What lemlist couldn't do: a technical failure, mapping it would overwrite a real status with noise.
  {
    id: "step_failed", label: "Step failed", family: "lemlist",
    events: ["AI variable failed", "API bounced", "Failed", "LinkedIn visit failed", "LinkedIn comment failed", "LinkedIn follow failed", "LinkedIn invite failed", "LinkedIn endorse failed", "LinkedIn message failed", "InMail failed", "LinkedIn invitation withdrawal failed", "LinkedIn like failed"],
  },
  { id: "nothing", label: "Nothing to act on", family: "lemlist", events: ["No post found"] },
];

export const MOVING_OUTCOMES = OUTCOMES.filter((o) => o.family === "contact");
export const STILL_OUTCOMES = OUTCOMES.filter((o) => o.family !== "contact");
export const EVENT_COUNT = OUTCOMES.reduce((n, o) => n + o.events.length, 0);

export type Mapping = Record<string, string | null>; // outcome id → contact status id (null = no effect)

export const COLORS: StatusPillType[] = ["neutral", "info", "critical", "warning", "amber", "orange", "success", "teal", "cyan", "sky", "indigo", "violet", "purple", "fuchsia", "pink"];

// ── lemlist default statuses (brand new team) ────────────────────────────────
const LEMLIST_STATUSES: ContactStatus[] = [
  { id: "st_new", name: "New", color: "info", column: "path" },
  { id: "st_contacted", name: "Contacted", color: "neutral", column: "path" },
  { id: "st_lead", name: "Lead", color: "pink", column: "path" },
  { id: "st_opportunity", name: "Opportunity", color: "purple", column: "path" },
  { id: "st_customer", name: "Customer", color: "orange", column: "path" },
  { id: "st_evangelist", name: "Evangelist", color: "teal", column: "path" },
  { id: "st_not_interested", name: "Not interested", color: "critical", column: "exit" },
  { id: "st_bad_timing", name: "Bad timing", color: "indigo", column: "exit" },
  { id: "st_dnc", name: "Do not contact", color: "warning", column: "exit" },
  { id: "st_unresponsive", name: "Unresponsive", color: "fuchsia", column: "exit" },
];

const LEMLIST_MAPPING: Mapping = {
  to_contact: "st_new", first_touch: "st_contacted", opened: "st_contacted", clicked: "st_lead", invite_accepted: "st_lead",
  replied: "st_lead", interested: "st_opportunity", meeting_booked: "st_opportunity", not_interested: "st_not_interested",
  unsubscribed: "st_dnc", not_delivered: "st_unresponsive",
};

// Production today: 6 values, set by hand only, nothing placed in a lifecycle.
const PROD_STATUSES: ContactStatus[] = [
  { id: "st_new", name: "New", color: "info", column: "unused", contacts: 3120 },
  { id: "st_lead", name: "Lead", color: "pink", column: "unused", contacts: 1840 },
  { id: "st_contacted", name: "Contacted", color: "neutral", column: "unused", contacts: 4210 },
  { id: "st_opportunity", name: "Opportunity", color: "purple", column: "unused", contacts: 612 },
  { id: "st_customer", name: "Customer", color: "orange", column: "unused", contacts: 287 },
  { id: "st_evangelist", name: "Evangelist", color: "teal", column: "unused", contacts: 0 },
];

// ── CRM picklists (Sync with CRM) ───────────────────────────────────────────
export interface CrmField {
  id: string;
  crm: "HubSpot";
  label: string;
  statuses: ContactStatus[];
  mapping: Mapping;
}

export const CRM_FIELDS: CrmField[] = [
  {
    id: "hs_lead_status", crm: "HubSpot", label: "Lead status",
    statuses: [
      { id: "hs_new", name: "New", color: "info", column: "path" },
      { id: "hs_attempted", name: "Attempted to contact", color: "neutral", column: "path" },
      { id: "hs_connected", name: "Connected", color: "sky", column: "path" },
      { id: "hs_in_progress", name: "In progress", color: "violet", column: "path" },
      { id: "hs_open_deal", name: "Open deal", color: "success", column: "path" },
      { id: "hs_unqualified", name: "Unqualified", color: "critical", column: "exit" },
      { id: "hs_bad_timing", name: "Bad timing", color: "indigo", column: "exit" },
      { id: "hs_open", name: "Open", color: "amber", column: "unused" },
    ],
    mapping: {
      to_contact: "hs_new", first_touch: "hs_attempted", opened: "hs_attempted", clicked: "hs_connected", invite_accepted: "hs_connected",
      replied: "hs_connected", interested: "hs_in_progress", meeting_booked: "hs_open_deal", not_interested: "hs_unqualified",
      unsubscribed: "hs_unqualified", not_delivered: null,
    },
  },
  {
    id: "hs_lifecyclestage", crm: "HubSpot", label: "Lifecycle stage",
    statuses: [
      { id: "lc_subscriber", name: "Subscriber", color: "neutral", column: "path" },
      { id: "lc_lead", name: "Lead", color: "pink", column: "path" },
      { id: "lc_mql", name: "Marketing qualified lead", color: "sky", column: "path" },
      { id: "lc_sql", name: "Sales qualified lead", color: "indigo", column: "path" },
      { id: "lc_opportunity", name: "Opportunity", color: "purple", column: "path" },
      { id: "lc_customer", name: "Customer", color: "orange", column: "path" },
      { id: "lc_evangelist", name: "Evangelist", color: "teal", column: "path" },
      { id: "lc_other", name: "Other", color: "amber", column: "unused" },
    ],
    mapping: {
      to_contact: "lc_subscriber", first_touch: "lc_lead", opened: "lc_lead", clicked: "lc_mql", invite_accepted: "lc_mql",
      replied: "lc_mql", interested: "lc_sql", meeting_booked: "lc_opportunity", not_interested: null, unsubscribed: null, not_delivered: null,
    },
  },
];

// ── Scenarios ───────────────────────────────────────────────────────────────
export type NewLeadRule = "latest" | "highest";

export interface Config {
  statuses: ContactStatus[];
  mapping: Mapping;
  enabled: boolean; // contact status moves with lead status
  crmFieldId: string | null; // statuses pulled from this CRM picklist
  newLeadRule: NewLeadRule;
}

export const emptyMapping = (): Mapping => Object.fromEntries(OUTCOMES.map((o) => [o.id, null]));

export const SCENARIOS: { id: string; label: string; hint: string; config: () => Config }[] = [
  {
    id: "brand_new", label: "Brand new team", hint: "lemlist defaults, mapping on",
    config: () => ({ statuses: structuredClone(LEMLIST_STATUSES), mapping: { ...emptyMapping(), ...LEMLIST_MAPPING }, enabled: true, crmFieldId: null, newLeadRule: "latest" }),
  },
  {
    id: "prod_today", label: "Existing team, today", hint: "6 manual statuses, nothing set up",
    config: () => ({ statuses: structuredClone(PROD_STATUSES), mapping: emptyMapping(), enabled: false, crmFieldId: null, newLeadRule: "latest" }),
  },
  {
    id: "hubspot", label: "Synced with HubSpot", hint: "Values from HubSpot Lead status",
    config: () => ({ statuses: structuredClone(CRM_FIELDS[0].statuses), mapping: { ...emptyMapping(), ...CRM_FIELDS[0].mapping }, enabled: true, crmFieldId: "hs_lead_status", newLeadRule: "latest" }),
  },
];

// Suggested placement when a team turns the feature on (PM note 27/10: propose, the team corrects).
export function suggestFor(statuses: ContactStatus[]): { statuses: ContactStatus[]; mapping: Mapping } {
  const byName = (n: string) => statuses.find((s) => s.name.toLowerCase() === n.toLowerCase())?.id ?? null;
  const order = ["new", "contacted", "lead", "opportunity", "customer", "evangelist"];
  const placed = statuses.map((s) => ({ ...s, column: (order.includes(s.name.toLowerCase()) ? "path" : s.column) as Column }));
  placed.sort((a, b) => {
    const ia = order.indexOf(a.name.toLowerCase()), ib = order.indexOf(b.name.toLowerCase());
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const mapping: Mapping = {
    ...emptyMapping(),
    to_contact: byName("new"), first_touch: byName("contacted"), opened: byName("contacted"), clicked: byName("lead"),
    invite_accepted: byName("lead"), replied: byName("lead"), interested: byName("opportunity"), meeting_booked: byName("opportunity"),
    not_interested: byName("not interested"), unsubscribed: byName("do not contact"), not_delivered: byName("unresponsive"),
  };
  return { statuses: placed, mapping };
}

// ── Simulator seed ──────────────────────────────────────────────────────────
export const SIM_CONTACT = {
  name: "Theresa Webb",
  initials: "TW",
  role: "Head of Sales",
  company: "Northwind",
  email: "theresa.webb@northwind.io",
};

export const SIM_CAMPAIGNS = ["Q1 outbound · Heads of Sales", "Webinar · Pipeline reviews", "Re-engage · Lost opportunities", "Product launch · lemAgent"];

export const CONTACT_COUNT = 12480;
