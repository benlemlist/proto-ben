// CRM sync · Custom activity mapping (PM: Edouard, FEATURE-4018), Ben's simplified version.
// One place per Salesforce object: each Salesforce field gets a lemlist field, a fixed value,
// or a value per activity. No separate "Default values" for activities.

export type ObjectId = "task" | "emailMessage" | "event";
export const OBJECT_LABEL: Record<ObjectId, string> = { task: "Tasks", emailMessage: "Email messages", event: "Events" };
export const OBJECT_SINGULAR: Record<ObjectId, string> = { task: "Task", emailMessage: "Email message", event: "Event" };

// ── Activities tab: where each lemlist activity lands (prod dropdown, unchanged) ──
export const DESTINATIONS = [
  { id: "emailMessage", label: "Email message", object: "emailMessage" },
  { id: "taskEmail", label: "Completed task · subtype Email", object: "task" },
  { id: "taskCall", label: "Completed task · subtype Call", object: "task" },
  { id: "taskLinkedIn", label: "Completed task · subtype LinkedIn", object: "task" },
  { id: "taskOpen", label: "Open task", object: "task" },
  { id: "event", label: "Event", object: "event" },
] as const satisfies readonly { id: string; label: string; object: ObjectId }[];
export type DestinationId = (typeof DESTINATIONS)[number]["id"];
export const objectOf = (d: DestinationId): ObjectId => DESTINATIONS.find((x) => x.id === d)!.object;

export type Activity = { id: string; label: string; group: string; on: boolean; destination: DestinationId };
export const ACTIVITY_GROUPS = ["Email activities", "LinkedIn activities", "Call activities", "Meeting activities", "Lead activities", "lemlist tasks"];

export const ACTIVITIES: Activity[] = [
  { id: "emailSent", label: "Email sent", group: "Email activities", on: true, destination: "emailMessage" },
  { id: "emailOpened", label: "Email opened", group: "Email activities", on: false, destination: "taskEmail" },
  { id: "emailClicked", label: "Link clicked", group: "Email activities", on: false, destination: "taskEmail" },
  { id: "emailReplied", label: "Email replied", group: "Email activities", on: true, destination: "emailMessage" },
  { id: "emailBounced", label: "Email bounced", group: "Email activities", on: true, destination: "taskEmail" },
  { id: "unsubscribed", label: "Unsubscribed", group: "Email activities", on: true, destination: "taskEmail" },
  { id: "externalSent", label: "External email sent", group: "Email activities", on: true, destination: "taskEmail" },
  { id: "externalReceived", label: "External email received", group: "Email activities", on: true, destination: "taskEmail" },
  { id: "liInvite", label: "Invitation sent", group: "LinkedIn activities", on: true, destination: "taskLinkedIn" },
  { id: "liMessage", label: "Message sent", group: "LinkedIn activities", on: true, destination: "taskLinkedIn" },
  { id: "liReplied", label: "Message replied", group: "LinkedIn activities", on: true, destination: "taskLinkedIn" },
  { id: "call", label: "Call done", group: "Call activities", on: true, destination: "taskCall" },
  { id: "meeting", label: "Meeting booked", group: "Meeting activities", on: true, destination: "taskEmail" },
  { id: "interested", label: "Marked as interested", group: "Lead activities", on: true, destination: "taskEmail" },
  { id: "notInterested", label: "Marked as not interested", group: "Lead activities", on: false, destination: "taskEmail" },
  { id: "callTask", label: "Call task", group: "lemlist tasks", on: true, destination: "taskOpen" },
  { id: "manualTask", label: "Manual task", group: "lemlist tasks", on: true, destination: "taskOpen" },
];

// ── lemlist activity fields (the values lemlist can write) ──
export type ValueType = "text" | "longtext" | "date" | "user" | "number" | "url";
export type LemlistField = { id: string; label: string; group: string; type: ValueType; carriedBy: "all" | string[]; example: string };

const EMAILS = ["emailSent", "emailOpened", "emailClicked", "emailReplied", "emailBounced", "unsubscribed", "externalSent", "externalReceived"];
const IN_CAMPAIGN = ["emailSent", "emailOpened", "emailClicked", "emailReplied", "emailBounced", "unsubscribed", "liInvite", "liMessage", "liReplied", "call", "callTask", "manualTask"];
const TASKS = ["callTask", "manualTask"];

export const LEMLIST_GROUPS = ["Activity", "Campaign & step", "Email", "LinkedIn", "Call", "Meeting", "lemlist task"];
export const LEMLIST_FIELDS: LemlistField[] = [
  { id: "activityDate", label: "Activity date", group: "Activity", type: "date", carriedBy: "all", example: "Nov 23, 2026" },
  { id: "owner", label: "Activity owner", group: "Activity", type: "user", carriedBy: "all", example: "Adrien Donot" },
  { id: "activityType", label: "Activity type", group: "Activity", type: "text", carriedBy: "all", example: "Email sent" },
  { id: "activityName", label: "Activity name", group: "Activity", type: "text", carriedBy: "all", example: "Email sent to Sarah Chen" },
  { id: "activitySummary", label: "Activity summary", group: "Activity", type: "longtext", carriedBy: "all", example: "Sarah opened your email twice…" },
  { id: "activityId", label: "lemlist activity ID", group: "Activity", type: "text", carriedBy: "all", example: "act_8fK2pQ" },
  { id: "lemlistLink", label: "Link to lemlist", group: "Activity", type: "url", carriedBy: "all", example: "app.lemlist.com/…" },
  { id: "campaign", label: "Campaign name", group: "Campaign & step", type: "text", carriedBy: IN_CAMPAIGN, example: "Q1 – VP Sales US" },
  { id: "step", label: "Sequence step", group: "Campaign & step", type: "number", carriedBy: IN_CAMPAIGN, example: "3" },
  { id: "template", label: "Template name", group: "Campaign & step", type: "text", carriedBy: ["emailSent", "liMessage"], example: "Follow-up #2" },
  { id: "subject", label: "Email subject", group: "Email", type: "text", carriedBy: EMAILS, example: "Re: Partnership for Q1" },
  { id: "body", label: "Email body", group: "Email", type: "longtext", carriedBy: ["emailSent", "emailReplied", "externalSent", "externalReceived"], example: "Hi Sarah, following up on…" },
  { id: "from", label: "Sender email", group: "Email", type: "text", carriedBy: EMAILS, example: "adrien@thenorthface.com" },
  { id: "to", label: "Recipient email", group: "Email", type: "text", carriedBy: EMAILS, example: "sarah@acme.io" },
  { id: "clickedLink", label: "Clicked link", group: "Email", type: "url", carriedBy: ["emailClicked"], example: "thenorthface.com/pro" },
  { id: "bounceReason", label: "Bounce reason", group: "Email", type: "text", carriedBy: ["emailBounced"], example: "Mailbox full" },
  { id: "liMessage", label: "LinkedIn message", group: "LinkedIn", type: "longtext", carriedBy: ["liInvite", "liMessage", "liReplied"], example: "Hi Sarah, saw your post on…" },
  { id: "liProfile", label: "LinkedIn profile URL", group: "LinkedIn", type: "url", carriedBy: ["liInvite", "liMessage", "liReplied"], example: "linkedin.com/in/sarahchen" },
  { id: "callOutcome", label: "Call outcome", group: "Call", type: "text", carriedBy: ["call"], example: "Connected" },
  { id: "callNote", label: "Call note", group: "Call", type: "longtext", carriedBy: ["call"], example: "Interested, call back in Jan" },
  { id: "callDuration", label: "Call duration (s)", group: "Call", type: "number", carriedBy: ["call"], example: "184" },
  { id: "callRecording", label: "Call recording URL", group: "Call", type: "url", carriedBy: ["call"], example: "rec.lemlist.com/…" },
  { id: "callSummary", label: "Call summary (AI)", group: "Call", type: "longtext", carriedBy: ["call"], example: "Sarah wants a demo for her team…" },
  { id: "meetingTitle", label: "Meeting title", group: "Meeting", type: "text", carriedBy: ["meeting"], example: "Demo lemlist × Acme" },
  { id: "meetingStart", label: "Meeting start", group: "Meeting", type: "date", carriedBy: ["meeting"], example: "Nov 27, 2026 10:00" },
  { id: "meetingEnd", label: "Meeting end", group: "Meeting", type: "date", carriedBy: ["meeting"], example: "Nov 27, 2026 10:30" },
  { id: "meetingLink", label: "Meeting link", group: "Meeting", type: "url", carriedBy: ["meeting"], example: "meet.google.com/abc" },
  { id: "taskTitle", label: "Task title", group: "lemlist task", type: "text", carriedBy: TASKS, example: "Call Sarah after the demo" },
  { id: "taskDescription", label: "Task description", group: "lemlist task", type: "longtext", carriedBy: TASKS, example: "Ask about the Q1 budget" },
  { id: "taskDue", label: "Task due date", group: "lemlist task", type: "date", carriedBy: TASKS, example: "Nov 25, 2026" },
  { id: "taskPriority", label: "Task priority", group: "lemlist task", type: "text", carriedBy: TASKS, example: "High" },
  // Today's frozen sentences, kept for existing teams until they edit.
  { id: "legacyTitle", label: "lemlist title (today's format)", group: "Activity", type: "text", carriedBy: "all", example: "[lemlist] Email sent with subject \"…\" - Q1 – VP Sales US - (step 3)" },
  { id: "legacyDescription", label: "lemlist description (today's format)", group: "Activity", type: "longtext", carriedBy: "all", example: "Campaign: … Sender: … Subject: … Text: …" },
];
export const lemlistField = (id: string) => LEMLIST_FIELDS.find((f) => f.id === id);

// ── Salesforce fields per object (a fake org: default + the customer's custom fields) ──
export type SfType = "text" | "textarea" | "date" | "user" | "picklist" | "number" | "url";
export type SfField = { api: string; label: string; type: SfType; custom?: boolean; options?: string[]; locked?: string };

const TYPE_OPTIONS = ["Call", "Email", "LinkedIn", "Meeting", "Other"];
const SOURCE_OPTIONS = ["lemlist", "Salesloft", "Manual"];

export const SF_FIELDS: Record<ObjectId, SfField[]> = {
  task: [
    { api: "Subject", label: "Subject", type: "text" },
    { api: "Description", label: "Comments", type: "textarea" },
    { api: "ActivityDate", label: "Due Date", type: "date", locked: "lemlist always writes the activity date here." },
    { api: "OwnerId", label: "Assigned To", type: "user", locked: "lemlist always writes the activity owner here." },
    { api: "Type", label: "Type", type: "picklist", options: TYPE_OPTIONS },
    { api: "Priority", label: "Priority", type: "picklist", options: ["High", "Normal", "Low"] },
    { api: "CallDisposition", label: "Call Result", type: "text" },
    { api: "CallDurationInSeconds", label: "Call Duration", type: "number" },
    { api: "Activity_Source__c", label: "Activity Source", type: "picklist", custom: true, options: SOURCE_OPTIONS },
    { api: "Sequence_Name__c", label: "Sequence Name", type: "text", custom: true },
    { api: "Sequence_Step__c", label: "Sequence Step", type: "number", custom: true },
    { api: "Template_Name__c", label: "Template Name", type: "text", custom: true },
    { api: "Call_Recording__c", label: "Call Recording", type: "url", custom: true },
    { api: "Bounce_Reason__c", label: "Bounce Reason", type: "text", custom: true },
    { api: "Clicked_Link__c", label: "Clicked Link", type: "url", custom: true },
    { api: "External_Activity_ID__c", label: "External Activity ID", type: "text", custom: true },
    { api: "Prospecting_Channel__c", label: "Prospecting Channel", type: "picklist", custom: true, options: ["Outbound email", "LinkedIn", "Cold call", "Inbound"] },
  ],
  emailMessage: [
    { api: "Subject", label: "Subject", type: "text" },
    { api: "HtmlBody", label: "HTML Body", type: "textarea" },
    { api: "FromAddress", label: "From Address", type: "text" },
    { api: "ToAddress", label: "To Address", type: "text" },
    { api: "MessageDate", label: "Message Date", type: "date", locked: "lemlist always writes the activity date here." },
    { api: "Activity_Source__c", label: "Activity Source", type: "picklist", custom: true, options: SOURCE_OPTIONS },
    { api: "Sequence_Name__c", label: "Sequence Name", type: "text", custom: true },
    { api: "Sequence_Step__c", label: "Sequence Step", type: "number", custom: true },
    { api: "External_Activity_ID__c", label: "External Activity ID", type: "text", custom: true },
  ],
  event: [
    { api: "Subject", label: "Subject", type: "text" },
    { api: "Description", label: "Description", type: "textarea" },
    { api: "StartDateTime", label: "Start", type: "date" },
    { api: "EndDateTime", label: "End", type: "date" },
    { api: "Location", label: "Location", type: "text" },
    { api: "OwnerId", label: "Assigned To", type: "user", locked: "lemlist always writes the activity owner here." },
    { api: "Type", label: "Type", type: "picklist", options: TYPE_OPTIONS },
    { api: "Activity_Source__c", label: "Activity Source", type: "picklist", custom: true, options: SOURCE_OPTIONS },
    { api: "Sequence_Name__c", label: "Sequence Name", type: "text", custom: true },
  ],
};
export const sfField = (o: ObjectId, api: string) => SF_FIELDS[o].find((f) => f.api === api)!;

const COMPATIBLE: Record<ValueType, SfType[]> = {
  text: ["text", "textarea", "picklist"],
  longtext: ["textarea"],
  date: ["date"],
  user: ["user"],
  number: ["number", "text", "textarea"],
  url: ["url", "text", "textarea"],
};
export const isCompatible = (lf: LemlistField, sf: SfField) => COMPATIBLE[lf.type].includes(sf.type);

// ── The mapping: one list of rows per object ──
export type Source =
  | { kind: "empty" }
  | { kind: "field"; field: string }
  | { kind: "fixed"; value: string }
  | { kind: "perActivity"; values: Record<string, string> };
export type Row = { api: string; source: Source };
export type Mapping = Record<ObjectId, Row[]>;

// Fallback when the mapped lemlist field is empty for an activity (implicit, shown as a hint).
export const FALLBACK: Partial<Record<string, string>> = { subject: "activityName", meetingTitle: "activityName", taskTitle: "activityName", callNote: "activitySummary", body: "activitySummary", liMessage: "activitySummary", taskDescription: "activitySummary" };

const typeByActivity: Record<string, string> = {
  emailOpened: "Email", emailClicked: "Email", emailBounced: "Email", unsubscribed: "Email", externalSent: "Email", externalReceived: "Email",
  liInvite: "LinkedIn", liMessage: "LinkedIn", liReplied: "LinkedIn", call: "Call", callTask: "Call", meeting: "Meeting",
  interested: "Other", notInterested: "Other", manualTask: "Other", emailSent: "Email", emailReplied: "Email",
};

/** New team: natural values ("free what lemlist freezes today"). */
export const NATURAL: Mapping = {
  task: [
    { api: "Subject", source: { kind: "field", field: "subject" } },
    { api: "Description", source: { kind: "field", field: "body" } },
    { api: "ActivityDate", source: { kind: "field", field: "activityDate" } },
    { api: "OwnerId", source: { kind: "field", field: "owner" } },
    { api: "Type", source: { kind: "perActivity", values: typeByActivity } },
    { api: "Activity_Source__c", source: { kind: "fixed", value: "lemlist" } },
    { api: "Sequence_Name__c", source: { kind: "field", field: "campaign" } },
    { api: "Sequence_Step__c", source: { kind: "field", field: "step" } },
    { api: "CallDisposition", source: { kind: "field", field: "callOutcome" } },
  ],
  emailMessage: [
    { api: "Subject", source: { kind: "field", field: "subject" } },
    { api: "HtmlBody", source: { kind: "field", field: "body" } },
    { api: "FromAddress", source: { kind: "field", field: "from" } },
    { api: "ToAddress", source: { kind: "field", field: "to" } },
    { api: "MessageDate", source: { kind: "field", field: "activityDate" } },
    { api: "Activity_Source__c", source: { kind: "fixed", value: "lemlist" } },
  ],
  event: [
    { api: "Subject", source: { kind: "field", field: "meetingTitle" } },
    { api: "StartDateTime", source: { kind: "field", field: "meetingStart" } },
    { api: "EndDateTime", source: { kind: "field", field: "meetingEnd" } },
    { api: "Location", source: { kind: "field", field: "meetingLink" } },
    { api: "OwnerId", source: { kind: "field", field: "owner" } },
    { api: "Type", source: { kind: "fixed", value: "Meeting" } },
    { api: "Activity_Source__c", source: { kind: "fixed", value: "lemlist" } },
  ],
};

/** Existing team: today's sentences pre-selected, nothing changes until they edit. */
export const LEGACY: Mapping = {
  task: [
    { api: "Subject", source: { kind: "field", field: "legacyTitle" } },
    { api: "Description", source: { kind: "field", field: "legacyDescription" } },
    { api: "ActivityDate", source: { kind: "field", field: "activityDate" } },
    { api: "OwnerId", source: { kind: "field", field: "owner" } },
  ],
  emailMessage: [
    { api: "Subject", source: { kind: "field", field: "legacyTitle" } },
    { api: "HtmlBody", source: { kind: "field", field: "legacyDescription" } },
    { api: "FromAddress", source: { kind: "field", field: "from" } },
    { api: "ToAddress", source: { kind: "field", field: "to" } },
    { api: "MessageDate", source: { kind: "field", field: "activityDate" } },
  ],
  event: [
    { api: "Subject", source: { kind: "field", field: "legacyTitle" } },
    { api: "Description", source: { kind: "field", field: "legacyDescription" } },
    { api: "OwnerId", source: { kind: "field", field: "owner" } },
  ],
};

export const EDOUARD_PROTO = "https://proto-crm-custom-activity-mapping.vercel.app/settings/crm";
