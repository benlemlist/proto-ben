/**
 * Lemlist — Universal Mock Dataset
 * =================================
 * Standalone, importable dataset for prototyping ANY Lemlist feature.
 *
 * Usage:
 *   import { team, campaigns, contacts, companies, activities, records, ... } from './mock-dataset.js';
 *
 * Content:
 *   CORE CRM
 *   - 12 team members (SDR, AE, BDR, CSM, Manager) with roles & permissions
 *   - 180 companies with enrichment data
 *   - 850 contacts with custom fields, experiences, enrichment
 *   - CRM statuses (pipeline stages), custom fields, lists
 *
 *   CAMPAIGNS & OUTREACH
 *   - 20 campaigns (multi-channel sequences, active/paused/ended)
 *   - Sequences with steps, A/B tests, schedules
 *   - Email templates, snippets, image templates
 *   - Campaign folders with hierarchy
 *
 *   ACTIVITIES & TRACKING
 *   - ~12k activities (emails, linkedin, calls, SMS, WhatsApp, API, manual)
 *   - Pre-aggregated daily records (ready for charts)
 *   - Activity log (display-ready)
 *   - Call-specific data (status, duration, direction)
 *   - LeadStats (pre-aggregated per-lead funnel)
 *
 *   INBOX & CONVERSATIONS
 *   - 60 inbox threads with read/unread, channels, replies
 *   - 25 opportunities (tasks to action)
 *   - Composer drafts
 *
 *   CALENDAR & MEETINGS
 *   - 5 meeting types (1:1, group, round-robin)
 *   - 35 booked meetings with attendees
 *
 *   EMAIL DELIVERABILITY
 *   - 8 mailboxes with warmup stats
 *   - Domain health, DKIM/SPF/DMARC
 *   - Inbox placement results
 *
 *   AI & COPILOT
 *   - Copilot conversations with messages
 *   - AI variable templates
 *   - Company descriptions with ICPs
 *
 *   BILLING & CREDITS
 *   - Licenses, credit balance, usage history
 *
 *   SETTINGS & CONFIG
 *   - Unsubscribes, webhooks, API keys
 *   - Notifications, labels, schedules
 *   - Watch lists with signals
 *   - Phone numbers
 *
 *   INTEGRATIONS
 *   - HubSpot/Salesforce sync state
 *   - Webhook configurations
 *
 * All data is deterministic (seeded RNG) — same output every run.
 */

// ═══════════════════════════════════════════════════════════════════
//  SEEDED RNG
// ═══════════════════════════════════════════════════════════════════

let _seed = 42;
const _rand = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
const _randInt = (min, max) => Math.floor(_rand() * (max - min + 1)) + min;
const _pick = (arr) => arr[_randInt(0, arr.length - 1)];
const _wpick = (items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = _rand() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
};
const _shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = _randInt(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const NOW = new Date();
const _daysAgo = (days) => { const d = new Date(NOW); d.setDate(d.getDate() - days); return d.toISOString().split("T")[0]; };
const _daysAgoMs = (days) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  d.setHours(_wpick([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], [2, 8, 10, 10, 5, 6, 10, 10, 8, 5, 2]), _randInt(0, 59), _randInt(0, 59));
  return d;
};

// ═══════════════════════════════════════════════════════════════════
//  LABELS & TAGS
// ═══════════════════════════════════════════════════════════════════

export const labels = [
  { id: "lbl_01", name: "Outbound", color: "#7ac3ff" },
  { id: "lbl_02", name: "Inbound", color: "#d7a6fc" },
  { id: "lbl_03", name: "ABM", color: "#adb4ff" },
  { id: "lbl_04", name: "Nurture", color: "#ff99ab" },
  { id: "lbl_05", name: "Re-engagement", color: "#fea668" },
  { id: "lbl_06", name: "Enterprise", color: "#fc9ac9" },
];

// ═══════════════════════════════════════════════════════════════════
//  CHANNELS
// ═══════════════════════════════════════════════════════════════════

export const channels = {
  tree: [
    { id: "email", label: "Email", children: [] },
    { id: "linkedin", label: "LinkedIn", children: [
      { id: "linkedin_connection", label: "Connection request" },
      { id: "linkedin_message", label: "Message" },
      { id: "linkedin_visit", label: "Profile visit" },
      { id: "linkedin_voice", label: "Voice note" },
    ]},
    { id: "call", label: "Call", children: [] },
    { id: "sms", label: "SMS", children: [] },
    { id: "whatsapp", label: "WhatsApp", children: [] },
    { id: "api", label: "API", children: [] },
  ],
  capabilities: {
    email:              { delivered: true,  opened: true,  clicked: true,  replied: true,  interested: true },
    linkedin:           { delivered: true,  opened: true,  clicked: false, replied: true,  interested: true },
    linkedin_connection:{ delivered: true,  opened: true,  clicked: false, replied: true,  interested: true },
    linkedin_message:   { delivered: true,  opened: true,  clicked: false, replied: true,  interested: true },
    linkedin_voice:     { delivered: true,  opened: true,  clicked: false, replied: true,  interested: true },
    linkedin_visit:     { delivered: true,  opened: true,  clicked: false, replied: false, interested: false },
    call:               { delivered: false, opened: false, clicked: false, replied: false, interested: true },
    sms:                { delivered: true,  opened: false, clicked: false, replied: true,  interested: false },
    whatsapp:           { delivered: true,  opened: true,  clicked: false, replied: true,  interested: false },
    api:                { delivered: true,  opened: false, clicked: false, replied: false, interested: true },
  },
  colors: {
    email: "#7ac3ff", linkedin: "#adb4ff", call: "#fea668",
    sms: "#ff99ab", whatsapp: "#72d699", api: "#d7a6fc", manual: "#a2c4d0",
  },
};

const STEP_TO_CHANNEL = {
  email: "email", linkedinInvite: "linkedin", linkedinSend: "linkedin",
  linkedinVoiceNote: "linkedin", linkedinVisit: "linkedin", phone: "call",
  sms: "sms", whatsappMessage: "whatsapp", api: "api", manual: "manual",
};
const STEP_TO_SUBCHANNEL = {
  email: "email", linkedinInvite: "linkedin_connection", linkedinSend: "linkedin_message",
  linkedinVoiceNote: "linkedin_voice", linkedinVisit: "linkedin_visit", phone: "call",
  sms: "sms", whatsappMessage: "whatsapp", api: "api", manual: "manual",
};

// ═══════════════════════════════════════════════════════════════════
//  ACTIVITY TYPE MAPPINGS (mirrors Lemlist codebase)
// ═══════════════════════════════════════════════════════════════════

const SENT_TYPE = {
  email: "emailsSent", linkedinInvite: "linkedinInviteDone", linkedinSend: "linkedinSent",
  linkedinVoiceNote: "linkedinVoiceNoteDone", linkedinVisit: "linkedinVisitDone",
  phone: "aircallDone", sms: "smsSent", whatsappMessage: "whatsappMessageSent",
  api: "apiDone", manual: "manualDone",
};
const OPEN_TYPE = { email: "emailsOpened", linkedinInvite: "linkedinOpened", linkedinSend: "linkedinOpened", linkedinVoiceNote: "linkedinOpened", whatsappMessage: "whatsappMessageOpened" };
const REPLY_TYPE = { email: "emailsReplied", linkedinInvite: "linkedinReplied", linkedinSend: "linkedinReplied", linkedinVoiceNote: "linkedinReplied", sms: "smsReplied", whatsappMessage: "whatsappReplied" };
const INTERESTED_TYPE = { email: "emailsInterested", linkedinInvite: "linkedinInterested", linkedinSend: "linkedinInterested", linkedinVoiceNote: "linkedinInterested", phone: "aircallInterested", api: "apiInterested", manual: "manualInterested" };
const NOT_INTERESTED_TYPE = { email: "emailsNotInterested", linkedinInvite: "linkedinNotInterested", linkedinSend: "linkedinNotInterested", linkedinVoiceNote: "linkedinNotInterested", phone: "aircallNotInterested" };
const BOUNCE_TYPE = { email: "emailsBounced", linkedinInvite: "linkedinInviteFailed", linkedinSend: "linkedinSendFailed", linkedinVoiceNote: "linkedinVoiceNoteFailed", linkedinVisit: "linkedinVisitFailed", sms: "smsFailed", whatsappMessage: "whatsappMessageFailed", api: "apiFailed" };
const CLICKED_TYPE = { email: "emailsClicked" };
const UNSUBSCRIBED_TYPE = { email: "emailsUnsubscribed" };

const CONTACTED_TYPES = Object.values(SENT_TYPE);
const OPENED_TYPES = Object.values(OPEN_TYPE);
const CLICKED_TYPES = Object.values(CLICKED_TYPE);
const REPLIED_TYPES = Object.values(REPLY_TYPE);
const INTERESTED_TYPES = Object.values(INTERESTED_TYPE);
const NOT_INTERESTED_TYPES = Object.values(NOT_INTERESTED_TYPE);
const BOUNCED_TYPES = Object.values(BOUNCE_TYPE);
const UNSUBSCRIBED_TYPES = Object.values(UNSUBSCRIBED_TYPE);

export const activityTypes = {
  SENT_TYPE, OPEN_TYPE, REPLY_TYPE, INTERESTED_TYPE, NOT_INTERESTED_TYPE,
  BOUNCE_TYPE, CLICKED_TYPE, UNSUBSCRIBED_TYPE,
  CONTACTED_TYPES, OPENED_TYPES, CLICKED_TYPES, REPLIED_TYPES,
  INTERESTED_TYPES, NOT_INTERESTED_TYPES, BOUNCED_TYPES, UNSUBSCRIBED_TYPES,
};

const ACT_TYPE_TO_STEP = {};
for (const map of [SENT_TYPE, OPEN_TYPE, REPLY_TYPE, INTERESTED_TYPE, NOT_INTERESTED_TYPE, BOUNCE_TYPE, CLICKED_TYPE, UNSUBSCRIBED_TYPE]) {
  for (const [stepType, actType] of Object.entries(map)) ACT_TYPE_TO_STEP[actType] = ACT_TYPE_TO_STEP[actType] || stepType;
}

// ═══════════════════════════════════════════════════════════════════
//  TEAM MEMBERS (12)
// ═══════════════════════════════════════════════════════════════════

export const team = [
  { id: "usr_m01", firstName: "Alice", lastName: "Martin", email: "alice.martin@acme.io", role: "SDR", emailsLimit: 180, linkedinLimit: 40, callLimit: 60, smsLimit: 30 },
  { id: "usr_m02", firstName: "Thomas", lastName: "Bernard", email: "thomas.bernard@acme.io", role: "SDR", emailsLimit: 200, linkedinLimit: 45, callLimit: 50, smsLimit: 25 },
  { id: "usr_m03", firstName: "Sofia", lastName: "Garcia", email: "sofia.garcia@acme.io", role: "SDR", emailsLimit: 150, linkedinLimit: 35, callLimit: 70, smsLimit: 20 },
  { id: "usr_m04", firstName: "Lucas", lastName: "Dubois", email: "lucas.dubois@acme.io", role: "AE", emailsLimit: 120, linkedinLimit: 30, callLimit: 40, smsLimit: 15 },
  { id: "usr_m05", firstName: "Emma", lastName: "Laurent", email: "emma.laurent@acme.io", role: "AE", emailsLimit: 160, linkedinLimit: 50, callLimit: 35, smsLimit: 20 },
  { id: "usr_m06", firstName: "Hugo", lastName: "Moreau", email: "hugo.moreau@acme.io", role: "AE", emailsLimit: 140, linkedinLimit: 40, callLimit: 45, smsLimit: 15 },
  { id: "usr_m07", firstName: "Chloe", lastName: "Lefebvre", email: "chloe.lefebvre@acme.io", role: "CSM", emailsLimit: 100, linkedinLimit: 25, callLimit: 30, smsLimit: 10 },
  { id: "usr_m08", firstName: "Nathan", lastName: "Roux", email: "nathan.roux@acme.io", role: "SDR", emailsLimit: 190, linkedinLimit: 45, callLimit: 55, smsLimit: 25 },
  { id: "usr_m09", firstName: "Lea", lastName: "Fournier", email: "lea.fournier@acme.io", role: "SDR", emailsLimit: 170, linkedinLimit: 40, callLimit: 50, smsLimit: 20 },
  { id: "usr_m10", firstName: "Raphael", lastName: "Girard", email: "raphael.girard@acme.io", role: "AE", emailsLimit: 110, linkedinLimit: 30, callLimit: 35, smsLimit: 10 },
  { id: "usr_m11", firstName: "Manon", lastName: "Andre", email: "manon.andre@acme.io", role: "BDR", emailsLimit: 130, linkedinLimit: 35, callLimit: 60, smsLimit: 20 },
  { id: "usr_m12", firstName: "Jules", lastName: "Mercier", email: "jules.mercier@acme.io", role: "Manager", emailsLimit: 80, linkedinLimit: 20, callLimit: 20, smsLimit: 10 },
];

// ═══════════════════════════════════════════════════════════════════
//  COMPANIES (180)
// ═══════════════════════════════════════════════════════════════════

const COMPANY_NAMES = [
  "TechFlow","DataSync","CloudNine","Growthly","Salesmatic","Revops.io","Stackly","Pipelinr",
  "LeadGen Pro","Outbound.co","SaaSify","MetricHub","SignalWave","NexGen","Synthetix",
  "Velocity.io","Nextera","Flowstack","Gridbase","Signalpath","Cortex AI","StreamOps",
  "CloudForge","DataPulse","Synapse Labs","AeroStack","PivotGrid","QuickBase","NovaTech","InfraLink",
  "Acme Corp","GlobalTech","Innovate Inc","Bright Systems","FutureScale","SmartGrid","TurboData",
  "QuantumLeap","CyberNest","DataVault","OptiFlow","ScaleUp","GrowthEngine","PulseTech",
  "NeuralPath","CodeCraft","ByteForge","PixelLogic","CloudBridge","DataStream","SwiftOps",
  "Apex Digital","CoreStack","FlexiTech","HyperScale","LogicWave","MindSpark","NetPrime",
  "OmniTech","ProSync","RapidBase","SkyNet Solutions","TrueVision","UltraData","VortexAI",
  "WebForge","XenoTech","ZenithOps","AlphaWave","BetaStack","ClearPath","DeltaForge",
  "EchoBase","FrostByte","GammaOps","HorizonAI","IonForge","JetStream","KineticData",
  "LunarTech","MegaPulse","NovaBridge","OrbitalOps","PrimeStack","QuantumOps","ReachFlow",
  "SolarStack","TitanOps","UnityForge","VectorAI","WaveStack","XploreTech","YieldOps","ZeroBase",
  "AgileForge","BloomTech","CrestOps","DriveAI","EliteStack","FlareOps","GlideBase",
  "HiveStack","ImpulseAI","JunctionOps","KaleidoTech","LinkForge","MatrixOps","NimbusAI",
  "OasisStack","PeakOps","QuestForge","RiftTech","SpireAI","TraceOps","UpliftStack",
  "VibeForge","WhirlOps","XceedAI","YonderStack","ZephyrOps","ArcForge","BoltTech",
  "CedarOps","DawnAI","EverStack","ForgePath","GroveOps","HavenTech","InsightAI","JadeStack",
  "KnotOps","LeafForge","MossAI","NorthStack","OakOps","PineForge","QuartzAI","RiverStack",
  "StoneOps","ThornForge","UmbraAI","ValleyStack","WindOps","AxisForge","BayTech","CoralOps",
  "DuneAI","EmberStack","FjordOps","GlacierForge","HarborAI","IsleStack","JettyOps",
  "KelpForge","LagoonAI","MarshStack","NestOps","OceanForge","PoolAI","ReefStack",
  "ShoreOps","TideForge","UndertowAI","WavecrестStack",
];

const INDUSTRIES = [
  "SaaS","FinTech","HealthTech","EdTech","E-commerce","Cybersecurity","AI/ML",
  "MarTech","HRTech","LegalTech","PropTech","CleanTech","InsurTech","AgriTech","DevTools",
  "Analytics","Logistics","Media","Gaming","Consulting",
];
const COMPANY_SIZES = ["1-10","11-50","51-200","201-500","501-1000","1001-5000","5000+"];
const COUNTRIES = ["United States","France","Germany","United Kingdom","Spain","Netherlands","Canada","Australia","Brazil","Japan","India","Sweden","Italy","Belgium","Switzerland"];
const CITIES_BY_COUNTRY = {
  "United States": ["San Francisco","New York","Austin","Boston","Chicago","Seattle","Miami","Denver","Los Angeles"],
  France: ["Paris","Lyon","Marseille","Toulouse","Bordeaux","Nantes","Lille"],
  Germany: ["Berlin","Munich","Hamburg","Frankfurt","Cologne","Stuttgart"],
  "United Kingdom": ["London","Manchester","Edinburgh","Birmingham","Bristol","Leeds"],
  Spain: ["Madrid","Barcelona","Valencia","Seville","Bilbao"],
  Netherlands: ["Amsterdam","Rotterdam","Utrecht","The Hague"],
  Canada: ["Toronto","Montreal","Vancouver","Ottawa","Calgary"],
  Australia: ["Sydney","Melbourne","Brisbane","Perth"],
  Brazil: ["Sao Paulo","Rio de Janeiro","Belo Horizonte"],
  Japan: ["Tokyo","Osaka","Kyoto"],
  India: ["Bangalore","Mumbai","Delhi","Hyderabad"],
  Sweden: ["Stockholm","Gothenburg","Malmo"],
  Italy: ["Milan","Rome","Turin"],
  Belgium: ["Brussels","Antwerp","Ghent"],
  Switzerland: ["Zurich","Geneva","Basel"],
};

_seed = 7777;
export const companies = COMPANY_NAMES.slice(0, 180).map((name, i) => {
  const country = _pick(COUNTRIES);
  const city = _pick(CITIES_BY_COUNTRY[country] || ["Capital"]);
  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, "") + _pick([".com", ".io", ".co", ".tech", ".ai"]);
  return {
    id: `comp_${String(i + 1).padStart(3, "0")}`,
    name,
    domain,
    industry: _pick(INDUSTRIES),
    size: _wpick(COMPANY_SIZES, [5, 15, 30, 25, 15, 8, 2]),
    country,
    city,
    website: `https://www.${domain}`,
    linkedinUrl: `https://linkedin.com/company/${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    revenue: _wpick(["<$1M", "$1M-$5M", "$5M-$20M", "$20M-$100M", "$100M+"], [10, 25, 35, 20, 10]),
  };
});

// ═══════════════════════════════════════════════════════════════════
//  CONTACTS (850, assigned to companies)
// ═══════════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  "James","Sarah","Michael","Laura","David","Marie","Pierre","Anna","Chen","Yuki",
  "Carlos","Fatima","Oliver","Nina","Ahmed","Priya","Felix","Clara","Bruno","Elif",
  "Sophie","Alex","Liam","Emma","Noah","Olivia","William","Ava","Benjamin","Isabella",
  "Lucas","Mia","Henry","Amelia","Daniel","Evelyn","Matthew","Abigail","Sebastian","Aria",
  "Leo","Scarlett","Theo","Grace","Owen","Chloe","Samuel","Riley","Tom","Julia",
  "Ethan","Hannah","Jack","Lily","Ryan","Zoe","Adam","Nora","Max","Ella",
  "Dylan","Maya","Nathan","Layla","Tyler","Aurora","Caleb","Hazel","Isaac","Violet",
  "Joshua","Luna","Luke","Stella","Gabriel","Nova","Julian","Ivy","Levi","Emilia",
];
const LAST_NAMES = [
  "Smith","Muller","Dupont","Rossi","Wang","Tanaka","Patel","Kim","Garcia","Andersson",
  "OBrien","Novak","Ivanov","Kowalski","Santos","Hansen","Berg","Dubois","Silva","Johnson",
  "Martin","Bernard","Laurent","Moreau","Lefebvre","Roux","Fournier","Meyer","Schmidt","Fischer",
  "Weber","Wagner","Becker","Hoffmann","Koch","Richter","Wolf","Perrin","Blanc","Morel",
];
const JOB_TITLES = [
  "CEO","CTO","VP Sales","VP Marketing","Head of Growth","Sales Director","Marketing Director",
  "Head of Sales","Head of Marketing","SDR Manager","AE Manager","BDR Manager",
  "Account Executive","Sales Manager","Business Development Manager","Growth Manager",
  "Revenue Operations Manager","Sales Operations Lead","Demand Gen Manager","CMO",
  "COO","CPO","Engineering Manager","Product Manager","Customer Success Manager",
  "Partnership Manager","Channel Manager","Regional Director","Country Manager",
];
const LEAD_STATUSES = ["contacted", "opened", "replied", "interested", "notInterested", "unsubscribed", "meeting_booked"];

_seed = 3333;
export const contacts = [];
const contactsPerCompany = {};

for (let i = 0; i < 850; i++) {
  const company = companies[i % companies.length];
  const firstName = _pick(FIRST_NAMES);
  const lastName = _pick(LAST_NAMES);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`;
  const contact = {
    id: `lead_${String(i + 1).padStart(4, "0")}`,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    initials: `${firstName[0]}${lastName[0]}`,
    email,
    phone: `+${_randInt(1, 49)} ${_randInt(100, 999)} ${_randInt(100, 999)} ${_randInt(1000, 9999)}`,
    jobTitle: _pick(JOB_TITLES),
    companyId: company.id,
    companyName: company.name,
    companyDomain: company.domain,
    linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${_randInt(1000, 9999)}`,
    country: company.country,
    city: company.city,
    status: _wpick(LEAD_STATUSES, [30, 25, 15, 10, 8, 5, 7]),
    createdAt: _daysAgo(_randInt(5, 90)),
    picture: null, // placeholder for avatar URL
    tags: _rand() > 0.6 ? [_pick(labels).name] : [],
  };
  contacts.push(contact);
  if (!contactsPerCompany[company.id]) contactsPerCompany[company.id] = [];
  contactsPerCompany[company.id].push(contact.id);
}

// Attach contact counts to companies
companies.forEach(c => { c.contactCount = (contactsPerCompany[c.id] || []).length; });

// ═══════════════════════════════════════════════════════════════════
//  CAMPAIGNS (20)
// ═══════════════════════════════════════════════════════════════════

const CAMPAIGN_DEFS = [
  { id: "cmp_01", name: "SaaS Decision Makers - Outbound", emoji: "🎯", state: "active", labels: ["lbl_01", "lbl_06"], senderIds: ["usr_m01", "usr_m02", "usr_m03"], leadsCount: 800, createdDaysAgo: 75, performanceMultiplier: 1.2, steps: [
    { type: "email", name: "Initial email", delay: 0 }, { type: "linkedinInvite", name: "LinkedIn invite", delay: 2 },
    { type: "email", name: "Follow-up email", delay: 3 }, { type: "linkedinSend", name: "LinkedIn message", delay: 2 },
    { type: "email", name: "Value email", delay: 3 }, { type: "phone", name: "Call task", delay: 2 }, { type: "email", name: "Break-up email", delay: 4 }] },
  { id: "cmp_02", name: "LinkedIn ABM Enterprise", emoji: "🏢", state: "active", labels: ["lbl_03", "lbl_06"], senderIds: ["usr_m04", "usr_m05"], leadsCount: 250, createdDaysAgo: 60, performanceMultiplier: 1.4, steps: [
    { type: "linkedinVisit", name: "Profile visit", delay: 0 }, { type: "linkedinInvite", name: "Connection request", delay: 1 },
    { type: "linkedinSend", name: "Intro message", delay: 3 }, { type: "email", name: "Follow-up email", delay: 3 },
    { type: "linkedinVoiceNote", name: "Voice note", delay: 2 }, { type: "email", name: "Case study email", delay: 3 }] },
  { id: "cmp_03", name: "Inbound MQL Nurture", emoji: "🌱", state: "active", labels: ["lbl_02", "lbl_04"], senderIds: ["usr_m06", "usr_m07"], leadsCount: 600, createdDaysAgo: 50, performanceMultiplier: 1.6, steps: [
    { type: "email", name: "Welcome email", delay: 0 }, { type: "email", name: "Value prop email", delay: 2 },
    { type: "whatsappMessage", name: "WhatsApp check-in", delay: 3 }, { type: "email", name: "Case study email", delay: 3 }, { type: "phone", name: "Discovery call", delay: 2 }] },
  { id: "cmp_04", name: "Cold Email - Tech Startups", emoji: "💻", state: "active", labels: ["lbl_01"], senderIds: ["usr_m01", "usr_m08", "usr_m09"], leadsCount: 900, createdDaysAgo: 40, performanceMultiplier: 0.9, steps: [
    { type: "email", name: "Initial email", delay: 0 }, { type: "email", name: "Follow-up 1", delay: 3 }, { type: "email", name: "Follow-up 2", delay: 3 }, { type: "email", name: "Break-up email", delay: 4 }] },
  { id: "cmp_05", name: "Re-engage Lost Deals", emoji: "🔄", state: "active", labels: ["lbl_05"], senderIds: ["usr_m04", "usr_m06", "usr_m10"], leadsCount: 350, createdDaysAgo: 30, performanceMultiplier: 0.7, steps: [
    { type: "email", name: "Re-engagement email", delay: 0 }, { type: "linkedinSend", name: "LinkedIn touch", delay: 3 },
    { type: "email", name: "New feature update", delay: 4 }, { type: "phone", name: "Call back", delay: 3 }] },
  { id: "cmp_06", name: "SMB Quick Outreach", emoji: "⚡", state: "active", labels: ["lbl_01"], senderIds: ["usr_m02", "usr_m03"], leadsCount: 500, createdDaysAgo: 25, performanceMultiplier: 1.0, steps: [
    { type: "email", name: "Short intro", delay: 0 }, { type: "sms", name: "SMS follow-up", delay: 2 }, { type: "email", name: "Value email", delay: 3 }] },
  { id: "cmp_07", name: "WhatsApp LATAM", emoji: "🌎", state: "active", labels: ["lbl_01"], senderIds: ["usr_m09", "usr_m11"], leadsCount: 300, createdDaysAgo: 20, performanceMultiplier: 1.3, steps: [
    { type: "whatsappMessage", name: "WhatsApp intro", delay: 0 }, { type: "whatsappMessage", name: "WhatsApp follow-up", delay: 2 },
    { type: "email", name: "Email follow-up", delay: 3 }, { type: "phone", name: "Call", delay: 3 }] },
  { id: "cmp_08", name: "API Partner Integrations", emoji: "🔗", state: "active", labels: ["lbl_03"], senderIds: ["usr_m05"], leadsCount: 150, createdDaysAgo: 45, performanceMultiplier: 0.8, steps: [
    { type: "api", name: "API trigger", delay: 0 }, { type: "email", name: "Partnership email", delay: 1 },
    { type: "linkedinInvite", name: "LinkedIn connect", delay: 3 }, { type: "email", name: "Follow-up", delay: 3 }] },
  { id: "cmp_09", name: "Event Follow-up - SaaStr 2026", emoji: "🎪", state: "paused", labels: ["lbl_02"], senderIds: ["usr_m01", "usr_m04", "usr_m12"], leadsCount: 180, createdDaysAgo: 55, performanceMultiplier: 1.5, steps: [
    { type: "email", name: "Nice to meet you", delay: 0 }, { type: "linkedinInvite", name: "LinkedIn connect", delay: 1 },
    { type: "email", name: "Recap + demo", delay: 3 }, { type: "phone", name: "Follow-up call", delay: 3 }, { type: "email", name: "Last chance", delay: 4 }] },
  { id: "cmp_10", name: "Mid-Market France", emoji: "🇫🇷", state: "paused", labels: ["lbl_01", "lbl_06"], senderIds: ["usr_m02", "usr_m06"], leadsCount: 400, createdDaysAgo: 65, performanceMultiplier: 1.1, steps: [
    { type: "email", name: "Email d'intro", delay: 0 }, { type: "linkedinVisit", name: "Visite profil", delay: 1 },
    { type: "linkedinInvite", name: "Invitation LinkedIn", delay: 1 }, { type: "email", name: "Email de relance", delay: 3 },
    { type: "linkedinSend", name: "Message LinkedIn", delay: 2 }, { type: "email", name: "Email final", delay: 4 }] },
  { id: "cmp_11", name: "UK Market Entry", emoji: "🇬🇧", state: "paused", labels: ["lbl_01"], senderIds: ["usr_m03", "usr_m08"], leadsCount: 320, createdDaysAgo: 70, performanceMultiplier: 0.85, steps: [
    { type: "email", name: "Introduction", delay: 0 }, { type: "email", name: "Social proof", delay: 3 },
    { type: "linkedinInvite", name: "LinkedIn", delay: 2 }, { type: "email", name: "Break-up", delay: 4 }] },
  { id: "cmp_12", name: "Product-Led Growth Activation", emoji: "🚀", state: "paused", labels: ["lbl_02", "lbl_04"], senderIds: ["usr_m07"], leadsCount: 700, createdDaysAgo: 35, performanceMultiplier: 1.3, steps: [
    { type: "email", name: "Onboarding tip #1", delay: 0 }, { type: "email", name: "Onboarding tip #2", delay: 2 },
    { type: "whatsappMessage", name: "WhatsApp check", delay: 3 }, { type: "email", name: "Upgrade nudge", delay: 3 }] },
  { id: "cmp_13", name: "Q4 Enterprise Push", emoji: "🏆", state: "ended", labels: ["lbl_01", "lbl_06"], senderIds: ["usr_m04", "usr_m05", "usr_m10"], leadsCount: 550, createdDaysAgo: 90, performanceMultiplier: 1.15, steps: [
    { type: "email", name: "Initial outreach", delay: 0 }, { type: "linkedinInvite", name: "LinkedIn invite", delay: 2 },
    { type: "linkedinSend", name: "LinkedIn message", delay: 3 }, { type: "email", name: "ROI email", delay: 3 },
    { type: "phone", name: "Call", delay: 2 }, { type: "email", name: "Break-up", delay: 4 }] },
  { id: "cmp_14", name: "Webinar Registrants Follow-up", emoji: "📹", state: "ended", labels: ["lbl_02"], senderIds: ["usr_m01", "usr_m07"], leadsCount: 420, createdDaysAgo: 80, performanceMultiplier: 1.45, steps: [
    { type: "email", name: "Thanks for attending", delay: 0 }, { type: "email", name: "Recording + slides", delay: 1 },
    { type: "email", name: "Book a demo", delay: 3 }, { type: "phone", name: "Follow-up call", delay: 3 }] },
  { id: "cmp_15", name: "Competitor Displacement", emoji: "⚔️", state: "ended", labels: ["lbl_01", "lbl_03"], senderIds: ["usr_m05", "usr_m06"], leadsCount: 200, createdDaysAgo: 85, performanceMultiplier: 0.75, steps: [
    { type: "email", name: "Pain point email", delay: 0 }, { type: "linkedinInvite", name: "LinkedIn connect", delay: 2 },
    { type: "email", name: "Comparison email", delay: 3 }, { type: "linkedinSend", name: "LinkedIn case study", delay: 3 }, { type: "email", name: "Offer email", delay: 3 }] },
  { id: "cmp_16", name: "DACH Region Outbound", emoji: "🇩🇪", state: "ended", labels: ["lbl_01"], senderIds: ["usr_m08", "usr_m11"], leadsCount: 280, createdDaysAgo: 88, performanceMultiplier: 0.95, steps: [
    { type: "email", name: "Intro email", delay: 0 }, { type: "linkedinVisit", name: "Profile visit", delay: 1 },
    { type: "linkedinInvite", name: "Connection", delay: 1 }, { type: "email", name: "Follow-up", delay: 3 }, { type: "sms", name: "SMS reminder", delay: 3 }] },
  { id: "cmp_17", name: "LinkedIn Only - C-Level", emoji: "👔", state: "active", labels: ["lbl_03", "lbl_06"], senderIds: ["usr_m10", "usr_m12"], leadsCount: 120, createdDaysAgo: 15, performanceMultiplier: 1.1, steps: [
    { type: "linkedinVisit", name: "Profile visit", delay: 0 }, { type: "linkedinInvite", name: "Invite", delay: 1 },
    { type: "linkedinSend", name: "Intro message", delay: 3 }, { type: "linkedinVoiceNote", name: "Voice note", delay: 3 }, { type: "linkedinSend", name: "Follow-up message", delay: 3 }] },
  { id: "cmp_18", name: "SMS Blitz - Trial Expiring", emoji: "📱", state: "active", labels: ["lbl_05"], senderIds: ["usr_m03", "usr_m09"], leadsCount: 220, createdDaysAgo: 10, performanceMultiplier: 1.2, steps: [
    { type: "sms", name: "Trial reminder", delay: 0 }, { type: "email", name: "Feature recap", delay: 1 },
    { type: "sms", name: "Last day SMS", delay: 2 }, { type: "phone", name: "Rescue call", delay: 1 }] },
  { id: "cmp_19", name: "Customer Upsell Q1", emoji: "📈", state: "active", labels: ["lbl_04"], senderIds: ["usr_m07", "usr_m12"], leadsCount: 160, createdDaysAgo: 18, performanceMultiplier: 1.35, steps: [
    { type: "email", name: "New plan announcement", delay: 0 }, { type: "email", name: "ROI recap", delay: 3 },
    { type: "whatsappMessage", name: "WhatsApp personal note", delay: 3 }, { type: "phone", name: "Account review call", delay: 3 }] },
  { id: "cmp_20", name: "Manual Task - Key Accounts", emoji: "🔑", state: "active", labels: ["lbl_03", "lbl_06"], senderIds: ["usr_m04", "usr_m05", "usr_m10", "usr_m12"], leadsCount: 80, createdDaysAgo: 22, performanceMultiplier: 1.5, steps: [
    { type: "manual", name: "Research & personalize", delay: 0 }, { type: "email", name: "Hyper-personalized email", delay: 1 },
    { type: "linkedinInvite", name: "LinkedIn invite", delay: 2 }, { type: "linkedinSend", name: "LinkedIn message", delay: 3 },
    { type: "phone", name: "Executive call", delay: 3 }, { type: "email", name: "Proposal email", delay: 2 }] },
];

export const campaigns = CAMPAIGN_DEFS.map(c => ({
  id: c.id,
  name: `${c.emoji} ${c.name}`,
  rawName: c.name,
  emoji: c.emoji,
  status: c.state === "ended" ? "completed" : c.state,
  state: c.state,
  labels: c.labels.map(lid => labels.find(l => l.id === lid)).filter(Boolean),
  tags: c.labels.map(lid => labels.find(l => l.id === lid)?.name).filter(Boolean),
  members: c.senderIds,
  channels: [...new Set(c.steps.map(s => STEP_TO_CHANNEL[s.type]).filter(ch => ch !== "manual"))],
  steps: c.steps.map((s, i) => ({ ...s, index: i, channel: STEP_TO_CHANNEL[s.type], subChannel: STEP_TO_SUBCHANNEL[s.type] })),
  leadsCount: c.leadsCount,
  createdAt: _daysAgo(c.createdDaysAgo),
  createdDaysAgo: c.createdDaysAgo,
  performanceMultiplier: c.performanceMultiplier,
}));

// ═══════════════════════════════════════════════════════════════════
//  CALL STATUSES (configurable per team, mirrors Lemlist)
// ═══════════════════════════════════════════════════════════════════

export const callStatuses = [
  { key: "connected", label: "Connected", category: "positive", color: "#31c52e" },
  { key: "connectedPositive", label: "Connected - Positive", category: "positive", color: "#31c52e" },
  { key: "connectedNeutral", label: "Connected - Neutral", category: "neutral", color: "#dfb009" },
  { key: "connectedNegative", label: "Connected - Negative", category: "negative", color: "#ec6181" },
  { key: "noAnswer", label: "No Answer", category: "negative", color: "#ec6181" },
  { key: "leftVoicemail", label: "Left Voicemail", category: "neutral", color: "#dfb009" },
  { key: "busy", label: "Busy", category: "negative", color: "#ec6181" },
  { key: "wrongNumber", label: "Wrong Number", category: "negative", color: "#ec6181" },
  { key: "gatekeeper", label: "Gatekeeper", category: "neutral", color: "#dfb009" },
  { key: "notInService", label: "Not In Service", category: "negative", color: "#ec6181" },
  { key: "meetingBooked", label: "Meeting Booked", category: "positive", color: "#31c52e" },
];

// ═══════════════════════════════════════════════════════════════════
//  CONVERSION RATES (per step type)
// ═══════════════════════════════════════════════════════════════════

const BASE_RATES = {
  email:              { openRate: 0.55, clickRate: 0.08, replyRate: 0.07, interestedRate: 0.03, notInterestedRate: 0.012, bounceRate: 0.04, unsubscribeRate: 0.005 },
  linkedinInvite:     { openRate: 0.65, clickRate: 0, replyRate: 0.09, interestedRate: 0.035, notInterestedRate: 0.01, bounceRate: 0.02, unsubscribeRate: 0 },
  linkedinSend:       { openRate: 0.60, clickRate: 0, replyRate: 0.06, interestedRate: 0.025, notInterestedRate: 0.008, bounceRate: 0.01, unsubscribeRate: 0 },
  linkedinVoiceNote:  { openRate: 0.58, clickRate: 0, replyRate: 0.11, interestedRate: 0.04, notInterestedRate: 0.01, bounceRate: 0.01, unsubscribeRate: 0 },
  linkedinVisit:      { openRate: 0, clickRate: 0, replyRate: 0, interestedRate: 0, notInterestedRate: 0, bounceRate: 0.02, unsubscribeRate: 0 },
  phone:              { openRate: 0, clickRate: 0, replyRate: 0, interestedRate: 0.03, notInterestedRate: 0.015, bounceRate: 0, unsubscribeRate: 0 },
  sms:                { openRate: 0, clickRate: 0, replyRate: 0.10, interestedRate: 0, notInterestedRate: 0, bounceRate: 0.03, unsubscribeRate: 0 },
  whatsappMessage:    { openRate: 0.72, clickRate: 0, replyRate: 0.13, interestedRate: 0, notInterestedRate: 0, bounceRate: 0.02, unsubscribeRate: 0 },
  api:                { openRate: 0, clickRate: 0, replyRate: 0, interestedRate: 0, notInterestedRate: 0, bounceRate: 0.05, unsubscribeRate: 0 },
  manual:             { openRate: 0, clickRate: 0, replyRate: 0, interestedRate: 0, notInterestedRate: 0, bounceRate: 0, unsubscribeRate: 0 },
};

// ═══════════════════════════════════════════════════════════════════
//  ACTIVITIES GENERATION (~12k)
// ═══════════════════════════════════════════════════════════════════

const CALL_STATUSES_WEIGHTED = ["connected", "noAnswer", "leftVoicemail", "busy", "wrongNumber"];

function generateActivities() {
  const acts = [];
  let actId = 0;
  _seed = 42;

  for (const campaign of CAMPAIGN_DEFS) {
    const seqId = `seq_${campaign.id.slice(4)}`;
    const startDay = campaign.createdDaysAgo;
    const endDay = campaign.state === "active" ? 0 : _randInt(5, 15);
    let remainingLeads = campaign.leadsCount;

    for (let stepIdx = 0; stepIdx < campaign.steps.length; stepIdx++) {
      const step = campaign.steps[stepIdx];
      const rates = BASE_RATES[step.type];
      const mult = campaign.performanceMultiplier;

      const dropRate = stepIdx === 0 ? 1.0 : 0.6 + _rand() * 0.25;
      remainingLeads = Math.floor(remainingLeads * dropRate);
      if (remainingLeads < 5) break;

      const sentCount = remainingLeads;
      const bounced = Math.floor(sentCount * rates.bounceRate * (0.8 + _rand() * 0.4));
      const delivered = sentCount - bounced;
      const opened = rates.openRate > 0 ? Math.floor(delivered * rates.openRate * mult * (0.85 + _rand() * 0.3)) : 0;
      const clicked = rates.clickRate > 0 ? Math.floor(opened * rates.clickRate * mult * (0.6 + _rand() * 0.8) / Math.max(rates.openRate, 0.01)) : 0;
      const replied = rates.replyRate > 0 ? Math.floor(delivered * rates.replyRate * mult * (0.7 + _rand() * 0.6)) : 0;
      const interested = rates.interestedRate > 0 ? Math.floor(delivered * rates.interestedRate * mult * (0.6 + _rand() * 0.8)) : 0;
      const notInterested = rates.notInterestedRate > 0 ? Math.floor(delivered * rates.notInterestedRate * (0.5 + _rand() * 1.0)) : 0;
      const unsubscribed = rates.unsubscribeRate > 0 ? Math.floor(delivered * rates.unsubscribeRate * (0.5 + _rand() * 1.0)) : 0;

      const stepDelay = campaign.steps.slice(0, stepIdx + 1).reduce((s, st) => s + st.delay, 0);
      const dayRangeStart = startDay - stepDelay;
      const dayRangeEnd = Math.max(endDay, dayRangeStart - 15);

      const makeActs = (type, count, extraFn) => {
        for (let i = 0; i < count; i++) {
          const sender = _pick(campaign.senderIds);
          const member = team.find(m => m.id === sender);
          const leadIdx = _randInt(0, Math.min(contacts.length - 1, campaign.leadsCount - 1));
          const lead = contacts[leadIdx];
          const act = {
            _id: `act_${String(++actId).padStart(6, "0")}`,
            type,
            teamId: "tea_mock01",
            campaignId: campaign.id,
            leadId: lead.id,
            contactName: lead.name,
            contactEmail: lead.email,
            companyId: lead.companyId,
            companyName: lead.companyName,
            sequenceId: seqId,
            sequenceStep: stepIdx,
            sendUserId: sender,
            sendUserEmail: member.email,
            createdAt: _daysAgoMs(_randInt(Math.max(0, dayRangeEnd), Math.max(0, dayRangeStart))),
            bot: false,
            stepType: step.type,
            stepName: step.name,
          };
          if (extraFn) Object.assign(act, extraFn());
          acts.push(act);
        }
      };

      makeActs(SENT_TYPE[step.type], sentCount);
      if (BOUNCE_TYPE[step.type] && bounced > 0) makeActs(BOUNCE_TYPE[step.type], bounced);
      if (OPEN_TYPE[step.type] && opened > 0) makeActs(OPEN_TYPE[step.type], opened);
      if (CLICKED_TYPE[step.type] && clicked > 0) makeActs(CLICKED_TYPE[step.type], clicked);
      if (REPLY_TYPE[step.type] && replied > 0) makeActs(REPLY_TYPE[step.type], replied);
      if (INTERESTED_TYPE[step.type] && interested > 0) makeActs(INTERESTED_TYPE[step.type], interested);
      if (NOT_INTERESTED_TYPE[step.type] && notInterested > 0) makeActs(NOT_INTERESTED_TYPE[step.type], notInterested);
      if (UNSUBSCRIBED_TYPE[step.type] && unsubscribed > 0) makeActs(UNSUBSCRIBED_TYPE[step.type], unsubscribed);

      // Call enrichment
      if (step.type === "phone") {
        acts.filter(a => a.campaignId === campaign.id && a.sequenceStep === stepIdx && a.type === "aircallDone")
          .forEach(ca => {
            ca.callStatus = _wpick(CALL_STATUSES_WEIGHTED, [35, 30, 15, 10, 10]);
            ca.duration = ca.callStatus === "connected" ? _randInt(30, 900) : _randInt(5, 60);
            ca.direction = "outbound";
          });
      }

      // Bot opens (email noise)
      if (step.type === "email" && opened > 0) {
        const botOpens = Math.floor(opened * 0.08);
        for (let i = 0; i < botOpens; i++) {
          const sender = _pick(campaign.senderIds);
          const member = team.find(m => m.id === sender);
          const leadIdx = _randInt(0, Math.min(contacts.length - 1, campaign.leadsCount - 1));
          acts.push({
            _id: `act_${String(++actId).padStart(6, "0")}`,
            type: "emailsOpened", teamId: "tea_mock01",
            campaignId: campaign.id, leadId: contacts[leadIdx].id,
            contactName: contacts[leadIdx].name, contactEmail: contacts[leadIdx].email,
            companyId: contacts[leadIdx].companyId, companyName: contacts[leadIdx].companyName,
            sequenceId: seqId, sequenceStep: stepIdx,
            sendUserId: sender, sendUserEmail: member.email,
            createdAt: _daysAgoMs(_randInt(Math.max(0, dayRangeEnd), Math.max(0, dayRangeStart))),
            bot: true, stepType: step.type, stepName: step.name,
          });
        }
      }
    }
  }

  // Orphan activities (manual outreach, ~15% extra volume)
  const orphanTypes = [
    { type: "emailsSent", stepType: "email", weight: 0.35 },
    { type: "linkedinSent", stepType: "linkedinSend", weight: 0.25 },
    { type: "linkedinInviteDone", stepType: "linkedinInvite", weight: 0.15 },
    { type: "aircallDone", stepType: "phone", weight: 0.20 },
    { type: "linkedinVisitDone", stepType: "linkedinVisit", weight: 0.05 },
  ];

  _seed = 5555;
  const orphanCount = Math.round(acts.filter(a => !a.bot).length * (0.12 + _rand() * 0.06));

  for (let i = 0; i < orphanCount; i++) {
    const daysAgo = _randInt(0, 59);
    const d = new Date(NOW);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(_randInt(7, 19), _randInt(0, 59), _randInt(0, 59));

    const picked = _wpick(orphanTypes, orphanTypes.map(o => o.weight));
    const member = _pick(team);
    const lead = _pick(contacts);

    const act = {
      _id: `orphan_${900000 + i}`,
      type: picked.type,
      teamId: "tea_mock01",
      campaignId: null,
      leadId: lead.id,
      contactName: lead.name,
      contactEmail: lead.email,
      companyId: lead.companyId,
      companyName: lead.companyName,
      sequenceId: null,
      sequenceStep: 0,
      sendUserId: member.id,
      sendUserEmail: member.email,
      createdAt: d,
      bot: false,
      stepType: picked.stepType,
      stepName: "",
    };

    if (picked.type === "aircallDone") {
      act.callStatus = _wpick(CALL_STATUSES_WEIGHTED, [35, 30, 15, 10, 10]);
      act.duration = act.callStatus === "connected" ? _randInt(30, 600) : _randInt(5, 25);
      act.direction = "outbound";
    }

    acts.push(act);

    // Follow-up events for orphans
    if (picked.type === "emailsSent") {
      if (_rand() < 0.65) acts.push({ ...act, _id: `orphan_fo_${i}_o`, type: "emailsOpened", createdAt: new Date(d.getTime() + _randInt(300, 7200) * 1000) });
      if (_rand() < 0.08) acts.push({ ...act, _id: `orphan_fo_${i}_r`, type: "emailsReplied", createdAt: new Date(d.getTime() + _randInt(1800, 86400) * 1000) });
      if (_rand() < 0.03) acts.push({ ...act, _id: `orphan_fo_${i}_i`, type: "emailsInterested", createdAt: new Date(d.getTime() + _randInt(3600, 172800) * 1000) });
      if (_rand() < 0.02) acts.push({ ...act, _id: `orphan_fo_${i}_b`, type: "emailsBounced", createdAt: new Date(d.getTime() + 60000) });
    }
    if (picked.type === "linkedinSent") {
      if (_rand() < 0.70) acts.push({ ...act, _id: `orphan_fo_${i}_o`, type: "linkedinOpened", createdAt: new Date(d.getTime() + _randInt(600, 14400) * 1000) });
      if (_rand() < 0.12) acts.push({ ...act, _id: `orphan_fo_${i}_r`, type: "linkedinReplied", createdAt: new Date(d.getTime() + _randInt(3600, 86400) * 1000) });
    }
    if (picked.type === "aircallDone" && act.callStatus === "connected" && _rand() < 0.25) {
      acts.push({ ...act, _id: `orphan_fo_${i}_ci`, type: "aircallInterested", createdAt: new Date(d.getTime() + _randInt(60, 300) * 1000) });
    }
  }

  acts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return acts;
}

export const activities = generateActivities();

// ═══════════════════════════════════════════════════════════════════
//  PRE-AGGREGATED DAILY RECORDS (ready for charts)
// ═══════════════════════════════════════════════════════════════════

function aggregateToRecords(acts) {
  const nonBot = acts.filter(a => !a.bot);
  const buckets = new Map();

  for (const act of nonBot) {
    const dateStr = act.createdAt.toISOString().split("T")[0];
    const stepType = act.stepType || ACT_TYPE_TO_STEP[act.type] || "email";
    const channel = STEP_TO_CHANNEL[stepType] || "email";
    const subChannel = STEP_TO_SUBCHANNEL[stepType] || channel;
    const campId = act.campaignId || "__orphan__";
    const key = `${dateStr}|${campId}|${act.sendUserId}|${act.sequenceStep}`;

    if (!buckets.has(key)) {
      const campDef = act.campaignId ? CAMPAIGN_DEFS.find(c => c.id === act.campaignId) : null;
      const stepDef = campDef?.steps[act.sequenceStep];
      buckets.set(key, {
        date: dateStr, campaignId: act.campaignId, memberId: act.sendUserId,
        channel, subChannel, stepType: stepDef?.type || stepType, stepIdx: act.sequenceStep, stepName: stepDef?.name || act.stepName || "",
        mode: "auto",
        contacted: 0, delivered: 0, opened: 0, clicked: 0, replied: 0,
        interested: 0, meetings: 0, bounced: 0, unsubscribed: 0, notInterested: 0,
      });
    }

    const b = buckets.get(key);
    if (CONTACTED_TYPES.includes(act.type)) b.contacted++;
    if (OPENED_TYPES.includes(act.type)) b.opened++;
    if (CLICKED_TYPES.includes(act.type)) b.clicked++;
    if (REPLIED_TYPES.includes(act.type)) b.replied++;
    if (INTERESTED_TYPES.includes(act.type)) b.interested++;
    if (NOT_INTERESTED_TYPES.includes(act.type)) b.notInterested++;
    if (BOUNCED_TYPES.includes(act.type)) b.bounced++;
    if (UNSUBSCRIBED_TYPES.includes(act.type)) b.unsubscribed++;
    if (act.type === "aircallDone" && act.callStatus === "connected" && act.duration > 120) b.meetings++;
    if (act.type === "aircallInterested") b.meetings++;
  }

  _seed = 999;
  const autoRates = { email: 0.85, linkedin: 0.75, call: 0, sms: 0.90, whatsapp: 0.85, api: 0.95, manual: 0 };

  return Array.from(buckets.values()).map(b => {
    b.delivered = b.contacted - b.bounced;
    const ar = b.campaignId ? (autoRates[b.channel] || 0) : 0;
    b.mode = ar === 0 ? "manual" : (_rand() < ar ? "auto" : "manual");

    // Account-level metrics (~35-50% of contacts)
    const acctRatio = 0.35 + _rand() * 0.15;
    const acctC = Math.round(b.contacted * acctRatio);
    const acctDel = Math.round(acctC * (0.92 + _rand() * 0.06));
    const acctO = b.opened > 0 ? Math.round(acctDel * (b.opened / Math.max(b.delivered, 1)) * (1 + _rand() * 0.2)) : 0;
    const acctCl = b.clicked > 0 ? Math.round(acctO * (b.clicked / Math.max(b.opened, 1)) * (1 + _rand() * 0.2)) : 0;
    const acctRep = b.replied > 0 ? Math.round(acctC * (b.replied / Math.max(b.delivered, 1)) * (1 + _rand() * 0.3)) : 0;
    const acctInter = b.interested > 0 ? Math.round(acctRep * 0.5 + _rand() * acctC * 0.03) : 0;
    const acctMtg = b.meetings > 0 ? Math.min(b.meetings, _randInt(0, b.meetings)) : 0;

    return {
      ...b,
      acctContacted: acctC, acctDelivered: acctDel, acctOpened: acctO, acctClicked: acctCl,
      acctReplied: acctRep, acctInterested: acctInter, acctMeetings: acctMtg,
    };
  });
}

export const records = aggregateToRecords(activities);

// ═══════════════════════════════════════════════════════════════════
//  ACTIVITY LOG (display-ready, 100 most recent)
// ═══════════════════════════════════════════════════════════════════

const ACT_STATUS_MAP = {
  emailsSent: "Delivered", emailsOpened: "Opened", emailsClicked: "Clicked", emailsReplied: "Replied",
  emailsBounced: "Bounced", emailsInterested: "Interested", emailsUnsubscribed: "Unsubscribed",
  emailsNotInterested: "Not Interested",
  linkedinInviteDone: "Invite sent", linkedinOpened: "Message read", linkedinSent: "Message sent",
  linkedinReplied: "Replied", linkedinVoiceNoteDone: "Voice note sent", linkedinVisitDone: "Profile visited",
  linkedinInterested: "Interested", linkedinNotInterested: "Not Interested",
  linkedinInviteFailed: "Invite failed", linkedinSendFailed: "Send failed",
  aircallDone: "Call completed", aircallInterested: "Interested", aircallNotInterested: "Not Interested",
  smsSent: "Delivered", smsReplied: "Replied", smsFailed: "Failed",
  whatsappMessageSent: "Delivered", whatsappMessageOpened: "Read", whatsappReplied: "Replied",
  apiDone: "Triggered", apiFailed: "Failed", manualDone: "Completed",
};

_seed = 777;
export const activityLog = activities
  .filter(a => !a.bot)
  .slice(-100)
  .reverse()
  .map(act => {
    const stepType = act.stepType || ACT_TYPE_TO_STEP[act.type] || "email";
    const ch = STEP_TO_CHANNEL[stepType] || "email";
    const camp = act.campaignId ? campaigns.find(c => c.id === act.campaignId) : null;
    const member = team.find(m => m.id === act.sendUserId);
    const h = act.createdAt.getHours();
    const m = act.createdAt.getMinutes();
    return {
      id: act._id,
      date: act.createdAt.toISOString().split("T")[0],
      time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      channel: ch,
      subChannel: STEP_TO_SUBCHANNEL[stepType] || ch,
      leadId: act.leadId,
      leadName: act.contactName,
      leadEmail: act.contactEmail,
      companyId: act.companyId,
      companyName: act.companyName,
      campaignId: act.campaignId,
      campaignName: camp?.name || "Direct outreach",
      memberId: act.sendUserId,
      memberName: member ? `${member.firstName} ${member.lastName[0]}.` : "",
      status: ACT_STATUS_MAP[act.type] || "Sent",
      activityType: act.type,
      mode: act.campaignId ? (ch === "call" || ch === "manual" ? "manual" : (_rand() > 0.25 ? "auto" : "manual")) : "manual",
      callStatus: act.callStatus || null,
      callDuration: act.duration || null,
    };
  });

// ═══════════════════════════════════════════════════════════════════
//  TASKS (mock, 120 tasks across team)
// ═══════════════════════════════════════════════════════════════════

_seed = 8888;
const TASK_TYPES = ["call", "email", "linkedin", "manual", "review"];
export const tasks = Array.from({ length: 120 }, (_, i) => {
  const member = _pick(team);
  const lead = _pick(contacts);
  const camp = _pick(campaigns);
  const daysUntilDue = _randInt(-5, 7);
  const dueDate = new Date(NOW);
  dueDate.setDate(dueDate.getDate() + daysUntilDue);
  const isDone = _rand() < 0.55;
  const isOverdue = !isDone && daysUntilDue < 0;
  return {
    id: `task_${String(i + 1).padStart(4, "0")}`,
    type: _pick(TASK_TYPES),
    status: isDone ? "done" : (isOverdue ? "overdue" : "pending"),
    memberId: member.id,
    memberName: `${member.firstName} ${member.lastName}`,
    leadId: lead.id,
    leadName: lead.name,
    companyName: lead.companyName,
    campaignId: camp.id,
    campaignName: camp.name,
    dueDate: dueDate.toISOString().split("T")[0],
    isToday: daysUntilDue === 0,
    isOverdue,
    createdAt: _daysAgo(_randInt(1, 30)),
  };
});

// ═══════════════════════════════════════════════════════════════════
//  METRIC LABELS & TOOLTIPS
// ═══════════════════════════════════════════════════════════════════

export const metricLabels = {
  contacted:     { neutral: "Attempted",     perChannel: { email: "Emails sent", linkedin: "LI actions sent", call: "Calls placed", sms: "SMS sent", whatsapp: "WA messages sent", api: "Webhooks fired", manual: "Tasks completed" }},
  delivered:     { neutral: "Reached",       perChannel: { email: "Emails delivered", linkedin: "LI delivered", sms: "SMS delivered", whatsapp: "WA delivered", api: "API delivered" }},
  opened:        { neutral: "Engaged",       perChannel: { email: "Emails opened", linkedin: "LI messages read", whatsapp: "WA read receipts" }},
  clicked:       { neutral: "Clicked",       perChannel: { email: "Links clicked" }},
  replied:       { neutral: "Replied",       perChannel: { email: "Email replies", linkedin: "LI replies", sms: "SMS replies", whatsapp: "WA replies" }},
  interested:    { neutral: "Interested",    perChannel: { email: "Email interested", linkedin: "LI interested", call: "Call interested", api: "API interested", manual: "Manual interested" }},
  meetings:      { neutral: "Meetings",      perChannel: {} },
  bounced:       { neutral: "Bounced",       perChannel: { email: "Hard bounces", linkedin: "LI failures", sms: "SMS failures", whatsapp: "WA failures", api: "API failures" }},
  unsubscribed:  { neutral: "Unsubscribed",  perChannel: { email: "Email unsubscribes" }},
  notInterested: { neutral: "Not Interested",perChannel: { email: "Email not interested", linkedin: "LI not interested", call: "Call not interested" }},
};

// ═══════════════════════════════════════════════════════════════════
//  HELPER UTILITIES
// ═══════════════════════════════════════════════════════════════════

/** Percentage helper: returns 0-100 float, handles division by zero */
export const pct = (num, den) => den > 0 ? Math.round((num / den) * 10000) / 100 : 0;

/** Format duration in seconds to "Xm Ys" */
export const fmtDuration = (seconds) => {
  if (!seconds || seconds < 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/** Get date range string for N days ago */
export const dateRange = (daysAgo) => ({
  start: _daysAgo(daysAgo),
  end: _daysAgo(0),
});

// ═══════════════════════════════════════════════════════════════════
//  CRM STATUSES (pipeline stages)
// ═══════════════════════════════════════════════════════════════════

_seed = 1111;
export const crmStatuses = [
  // Contact pipeline
  { id: "cst_01", teamId: "tea_mock01", entity: "contact", position: 0, name: "New", color: "#7ac3ff" },
  { id: "cst_02", teamId: "tea_mock01", entity: "contact", position: 1, name: "Contacted", color: "#adb4ff" },
  { id: "cst_03", teamId: "tea_mock01", entity: "contact", position: 2, name: "Engaged", color: "#d7a6fc" },
  { id: "cst_04", teamId: "tea_mock01", entity: "contact", position: 3, name: "Qualified", color: "#fea668" },
  { id: "cst_05", teamId: "tea_mock01", entity: "contact", position: 4, name: "Meeting Booked", color: "#72d699" },
  { id: "cst_06", teamId: "tea_mock01", entity: "contact", position: 5, name: "Won", color: "#31c52e" },
  { id: "cst_07", teamId: "tea_mock01", entity: "contact", position: 6, name: "Lost", color: "#ec6181" },
  // Company pipeline
  { id: "cst_08", teamId: "tea_mock01", entity: "company", position: 0, name: "Prospect", color: "#7ac3ff" },
  { id: "cst_09", teamId: "tea_mock01", entity: "company", position: 1, name: "In Progress", color: "#fea668" },
  { id: "cst_10", teamId: "tea_mock01", entity: "company", position: 2, name: "Customer", color: "#31c52e" },
  { id: "cst_11", teamId: "tea_mock01", entity: "company", position: 3, name: "Churned", color: "#ec6181" },
];

// ═══════════════════════════════════════════════════════════════════
//  CUSTOM FIELDS
// ═══════════════════════════════════════════════════════════════════

export const customFields = [
  { id: "csf_01", teamId: "tea_mock01", entity: "contact", type: "text", name: "linkedin_headline", display: "LinkedIn Headline" },
  { id: "csf_02", teamId: "tea_mock01", entity: "contact", type: "select", name: "lead_source", display: "Lead Source", values: ["Website", "LinkedIn", "Referral", "Event", "Cold Outreach", "Inbound", "Partner"] },
  { id: "csf_03", teamId: "tea_mock01", entity: "contact", type: "number", name: "deal_value", display: "Deal Value" },
  { id: "csf_04", teamId: "tea_mock01", entity: "contact", type: "date", name: "last_meeting_date", display: "Last Meeting Date" },
  { id: "csf_05", teamId: "tea_mock01", entity: "contact", type: "boolean", name: "decision_maker", display: "Decision Maker" },
  { id: "csf_06", teamId: "tea_mock01", entity: "contact", type: "phone", name: "mobile_phone", display: "Mobile Phone" },
  { id: "csf_07", teamId: "tea_mock01", entity: "contact", type: "user", name: "account_owner", display: "Account Owner" },
  { id: "csf_08", teamId: "tea_mock01", entity: "company", type: "select", name: "company_tier", display: "Tier", values: ["Enterprise", "Mid-Market", "SMB", "Startup"] },
  { id: "csf_09", teamId: "tea_mock01", entity: "company", type: "number", name: "annual_revenue", display: "Annual Revenue" },
  { id: "csf_10", teamId: "tea_mock01", entity: "company", type: "text", name: "tech_stack", display: "Tech Stack" },
];

// ═══════════════════════════════════════════════════════════════════
//  CRM LISTS (segments/views)
// ═══════════════════════════════════════════════════════════════════

export const crmLists = [
  { id: "clt_01", teamId: "tea_mock01", entity: "contact", name: "All Contacts", createdBy: "usr_m12" },
  { id: "clt_02", teamId: "tea_mock01", entity: "contact", name: "Hot Leads", createdBy: "usr_m01" },
  { id: "clt_03", teamId: "tea_mock01", entity: "contact", name: "Decision Makers", createdBy: "usr_m04" },
  { id: "clt_04", teamId: "tea_mock01", entity: "contact", name: "Need Follow-up", createdBy: "usr_m02" },
  { id: "clt_05", teamId: "tea_mock01", entity: "contact", name: "Replied - No Meeting", createdBy: "usr_m05" },
  { id: "clt_06", teamId: "tea_mock01", entity: "company", name: "All Companies", createdBy: "usr_m12" },
  { id: "clt_07", teamId: "tea_mock01", entity: "company", name: "Enterprise Targets", createdBy: "usr_m04" },
  { id: "clt_08", teamId: "tea_mock01", entity: "company", name: "Active Accounts", createdBy: "usr_m06" },
];

// ═══════════════════════════════════════════════════════════════════
//  CAMPAIGN FOLDERS
// ═══════════════════════════════════════════════════════════════════

export const campaignFolders = [
  { id: "fldr_01", teamId: "tea_mock01", name: "Outbound", color: "#7ac3ff", parentId: null, order: 0, createdBy: "usr_m12" },
  { id: "fldr_02", teamId: "tea_mock01", name: "Inbound", color: "#d7a6fc", parentId: null, order: 1, createdBy: "usr_m12" },
  { id: "fldr_03", teamId: "tea_mock01", name: "ABM", color: "#adb4ff", parentId: null, order: 2, createdBy: "usr_m04" },
  { id: "fldr_04", teamId: "tea_mock01", name: "Q1 2026", color: "#fea668", parentId: "fldr_01", order: 0, createdBy: "usr_m12" },
  { id: "fldr_05", teamId: "tea_mock01", name: "Archived", color: "#a2c4d0", parentId: null, order: 3, createdBy: "usr_m12" },
];

// ═══════════════════════════════════════════════════════════════════
//  SEQUENCES (detailed step configs for each campaign)
// ═══════════════════════════════════════════════════════════════════

export const sequences = campaigns.map(c => ({
  id: `seq_${c.id.slice(4)}`,
  teamId: "tea_mock01",
  campaignId: c.id,
  createdAt: c.createdAt,
  steps: c.steps.map((s, i) => ({
    _id: `stp_${c.id.slice(4)}_${i}`,
    type: s.type,
    delay: s.delay,
    name: s.name,
    index: i,
    channel: s.channel,
    subChannel: s.subChannel,
    emailTemplateId: s.type === "email" ? `etp_${_randInt(1, 15).toString().padStart(2, "0")}` : null,
    manual: ["phone", "manual"].includes(s.type),
    priority: s.type === "phone" ? 2 : 1,
  })),
}));

// ═══════════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES (15)
// ═══════════════════════════════════════════════════════════════════

_seed = 2222;
const EMAIL_SUBJECTS = [
  "Quick question about {{companyName}}", "{{firstName}}, a quick intro", "Following up — {{companyName}}",
  "Idea for {{companyName}}", "{{firstName}}, saw your work at {{companyName}}", "Congrats on the recent news!",
  "Can we chat this week?", "Re: {{companyName}} + Acme synergy", "{{firstName}}, one last thing",
  "Worth a quick look?", "Thought of you when I saw this", "Quick 15 min call?",
  "New case study: {{industry}} success", "{{firstName}} — meeting request", "Break-up email 😢",
];
const EMAIL_BODIES = [
  "Hi {{firstName}},\n\nI noticed {{companyName}} has been growing fast and I wanted to reach out about how we might be able to help with your outreach.\n\nWould you be open to a quick chat this week?\n\nBest,\n{{senderName}}",
  "Hi {{firstName}},\n\nI'm reaching out because we've helped companies like {{companyName}} improve their outreach by 3x.\n\nWould it make sense to connect for 15 minutes?\n\n{{senderName}}",
  "Hi {{firstName}},\n\nJust circling back on my previous message. I know things get busy at {{companyName}}.\n\nHappy to find a time that works for a quick call.\n\nBest,\n{{senderName}}",
  "Hi {{firstName}},\n\nI wanted to share a case study from a company similar to {{companyName}} that saw a 45% increase in pipeline.\n\nWorth a quick look?\n\n{{senderName}}",
  "Hi {{firstName}},\n\nI see you haven't had a chance to reply yet — totally understand! Here's a 2-min video showing how we helped a company in {{industry}} book 30% more meetings.\n\nLet me know if you'd like to explore this.\n\nBest,\n{{senderName}}",
];

export const emailTemplates = EMAIL_SUBJECTS.map((subject, i) => ({
  id: `etp_${String(i + 1).padStart(2, "0")}`,
  teamId: "tea_mock01",
  name: subject.replace(/\{\{.*?\}\}/g, "..."),
  subject,
  message: EMAIL_BODIES[i % EMAIL_BODIES.length],
  type: "email",
  category: _pick(["outreach", "follow-up", "break-up", "nurture", "event"]),
  public: _rand() > 0.3,
  plainText: false,
  createdBy: _pick(team).id,
  createdAt: _daysAgo(_randInt(10, 120)),
  cc: [],
  images: [],
  videos: [],
}));

// ═══════════════════════════════════════════════════════════════════
//  SNIPPETS (8)
// ═══════════════════════════════════════════════════════════════════

export const snippets = [
  { id: "snt_01", teamId: "tea_mock01", name: "Intro - who we are", content: "We're Acme, a sales engagement platform trusted by 10,000+ companies to book more meetings.", createdBy: "usr_m12" },
  { id: "snt_02", teamId: "tea_mock01", name: "Social proof", content: "Companies like DataSync, TechFlow, and NexGen have seen a 3x increase in reply rates using our platform.", createdBy: "usr_m01" },
  { id: "snt_03", teamId: "tea_mock01", name: "CTA - meeting", content: "Would you have 15 minutes this week for a quick call? Here's my calendar: {{calendarLink}}", createdBy: "usr_m04" },
  { id: "snt_04", teamId: "tea_mock01", name: "CTA - soft", content: "No pressure at all — just wanted to plant the seed. Happy to share more context whenever it makes sense.", createdBy: "usr_m05" },
  { id: "snt_05", teamId: "tea_mock01", name: "Objection - not interested", content: "Totally understand! Mind if I ask what you're currently using? Sometimes it helps to compare approaches.", createdBy: "usr_m02" },
  { id: "snt_06", teamId: "tea_mock01", name: "Break-up", content: "I don't want to be a nuisance, so this will be my last message. If things change, I'm always here to chat.", createdBy: "usr_m03" },
  { id: "snt_07", teamId: "tea_mock01", name: "Signature - formal", content: "Best regards,\n{{senderName}}\n{{senderTitle}} | Acme\n{{senderPhone}}", createdBy: "usr_m12" },
  { id: "snt_08", teamId: "tea_mock01", name: "PS line", content: "P.S. I saw {{companyName}} just raised a round — congrats! Would love to help you scale outreach as you grow.", createdBy: "usr_m08" },
];

// ═══════════════════════════════════════════════════════════════════
//  SCHEDULES (sending windows)
// ═══════════════════════════════════════════════════════════════════

export const schedules = [
  { id: "skd_01", teamId: "tea_mock01", name: "Business Hours (Default)", start: "09:00", end: "18:00", timezone: "Europe/Paris", weekdays: [1, 2, 3, 4, 5], quantity: null, secondsToWait: 60 },
  { id: "skd_02", teamId: "tea_mock01", name: "Morning Only", start: "08:00", end: "12:00", timezone: "Europe/Paris", weekdays: [1, 2, 3, 4, 5], quantity: null, secondsToWait: 90 },
  { id: "skd_03", teamId: "tea_mock01", name: "US Business Hours", start: "09:00", end: "17:00", timezone: "America/New_York", weekdays: [1, 2, 3, 4, 5], quantity: null, secondsToWait: 45 },
  { id: "skd_04", teamId: "tea_mock01", name: "LATAM Hours", start: "10:00", end: "19:00", timezone: "America/Sao_Paulo", weekdays: [1, 2, 3, 4, 5], quantity: null, secondsToWait: 60 },
];

// ═══════════════════════════════════════════════════════════════════
//  LEADS (campaign-level, 200 sample leads)
// ═══════════════════════════════════════════════════════════════════

_seed = 4444;
const LEAD_STATES = ["new", "contacted", "opened", "clicked", "replied", "interested", "notInterested", "unsubscribed", "paused"];

export const leads = [];
for (let i = 0; i < 200; i++) {
  const contact = contacts[i % contacts.length];
  const camp = campaigns[_randInt(0, campaigns.length - 1)];
  const sender = _pick(camp.members);
  leads.push({
    id: `led_${String(i + 1).padStart(4, "0")}`,
    campaignId: camp.id,
    teamId: "tea_mock01",
    contactId: contact.id,
    companyId: contact.companyId,
    email: contact.email,
    state: _wpick(LEAD_STATES, [5, 25, 20, 8, 15, 10, 7, 3, 7]),
    paused: _rand() < 0.05,
    sendUserId: sender,
    sendUserEmail: team.find(m => m.id === sender)?.email,
    variables: {
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      companyName: contact.companyName,
      jobTitle: contact.jobTitle,
      phone: contact.phone,
      picture: null,
      linkedinUrl: contact.linkedinUrl,
      icebreaker: _rand() > 0.7 ? `I saw ${contact.companyName} is doing great things in ${_pick(INDUSTRIES)}!` : null,
    },
    source: _pick(["manual", "csv", "api", "crm", "extension", "lemleads"]),
    importId: _rand() > 0.7 ? `imp_${_randInt(1, 20).toString().padStart(3, "0")}` : null,
    score: _randInt(0, 100),
    createdAt: _daysAgo(_randInt(1, 90)),
  });
}

// ═══════════════════════════════════════════════════════════════════
//  INBOX THREADS (60)
// ═══════════════════════════════════════════════════════════════════

_seed = 5000;
const INBOX_CHANNELS = ["email", "linkedin", "whatsapp", "sms"];

export const inboxThreads = [];
for (let i = 0; i < 60; i++) {
  const contact = contacts[_randInt(0, contacts.length - 1)];
  const assignedTo = _pick(team);
  const ch = _wpick(INBOX_CHANNELS, [50, 30, 12, 8]);
  const camp = _rand() > 0.3 ? campaigns[_randInt(0, campaigns.length - 1)] : null;
  const hasReplied = _rand() > 0.4;
  const daysAgo = _randInt(0, 45);
  const isRead = _rand() > 0.35;

  inboxThreads.push({
    id: `ibx_${String(i + 1).padStart(3, "0")}`,
    teamId: "tea_mock01",
    contactId: contact.id,
    contactName: contact.name,
    contactEmail: contact.email,
    companyName: contact.companyName,
    channel: ch,
    channels: [ch],
    campaignId: camp?.id || null,
    campaignName: camp?.name || null,
    lastActivityAt: _daysAgo(daysAgo),
    lastRepliedAt: hasReplied ? _daysAgo(daysAgo) : null,
    lastRepliedChannel: hasReplied ? ch : null,
    lastSubject: _pick(EMAIL_SUBJECTS).replace(/\{\{.*?\}\}/g, contact.companyName),
    lastMessagePreview: hasReplied
      ? _pick(["Thanks for reaching out! Let me check with my team.", "Sounds interesting, can we schedule a call?", "Not interested at this time, thanks.", "Can you send more details?", "I'm OOO until next week.", "Let me loop in my colleague on this."])
      : _pick(["Following up on my previous email...", "Quick question about your stack", "Would love to connect"]),
    isYourTurn: hasReplied && _rand() > 0.5,
    haveReplies: hasReplied,
    users: [{
      userId: assignedTo.id,
      read: isRead,
      sender: !hasReplied,
      favorite: _rand() > 0.85,
      snoozeUntil: _rand() > 0.9 ? _daysAgo(-_randInt(1, 7)) : null,
    }],
    labels: _rand() > 0.7 ? [_pick(labels).id] : [],
    messageCount: _randInt(1, 8),
    createdAt: _daysAgo(_randInt(daysAgo, 90)),
  });
}

// ═══════════════════════════════════════════════════════════════════
//  OPPORTUNITIES (25)
// ═══════════════════════════════════════════════════════════════════

_seed = 5500;
const OPP_TYPES = ["reply", "manual", "call", "linkedin", "review"];
const OPP_STATES = ["pending", "done", "ignored"];

export const opportunities = [];
for (let i = 0; i < 25; i++) {
  const contact = contacts[_randInt(0, contacts.length - 1)];
  const camp = campaigns[_randInt(0, campaigns.length - 1)];
  const assignee = _pick(team);
  const oppType = _wpick(OPP_TYPES, [30, 25, 20, 15, 10]);
  const state = _wpick(OPP_STATES, [50, 30, 20]);
  const daysAgo = _randInt(0, 14);

  opportunities.push({
    id: `opp_${String(i + 1).padStart(3, "0")}`,
    teamId: "tea_mock01",
    campaignId: camp.id,
    contactId: contact.id,
    companyId: contact.companyId,
    leadName: contact.name,
    leadEmail: contact.email,
    leadCompanyName: contact.companyName,
    leadJobTitle: contact.jobTitle,
    leadPicture: null,
    type: oppType,
    state,
    title: oppType === "reply" ? "Reply received" : oppType === "call" ? "Call task" : oppType === "manual" ? "Manual task" : oppType === "linkedin" ? "LinkedIn action" : "Lead review",
    channel: oppType === "call" ? "call" : oppType === "linkedin" ? "linkedin" : "email",
    priority: _wpick([0, 1, 2], [20, 60, 20]),
    assignedTo: assignee.id,
    isDue: state === "pending" && _rand() > 0.6,
    doneAt: state === "done" ? _daysAgo(daysAgo - _randInt(0, 3)) : null,
    doneBy: state === "done" ? assignee.id : null,
    createdAt: _daysAgo(daysAgo),
    score: _randInt(0, 100),
  });
}

// ═══════════════════════════════════════════════════════════════════
//  MAILBOXES (8, with warmup stats)
// ═══════════════════════════════════════════════════════════════════

_seed = 6000;
const PROVIDERS = ["google", "microsoft", "smtp"];

export const mailboxes = [];
for (let i = 0; i < 8; i++) {
  const member = team[i % team.length];
  const provider = _wpick(PROVIDERS, [50, 35, 15]);
  const domain = i < 4 ? "acme.io" : _pick(["acme-sales.io", "try-acme.com", "outreach-acme.io"]);

  mailboxes.push({
    id: `usm_${String(i + 1).padStart(3, "0")}`,
    userId: member.id,
    teamIds: ["tea_mock01"],
    email: `${member.firstName.toLowerCase()}.${member.lastName.toLowerCase()}@${domain}`,
    provider,
    status: _rand() > 0.1 ? "connected" : "error",
    error: _rand() > 0.9 ? { code: "AUTH_FAILED", message: "Token expired, please reconnect" } : null,
    dailySendLimit: member.emailsLimit,
    dailySentToday: _randInt(0, member.emailsLimit),
    warmup: {
      active: _rand() > 0.3,
      warmEmailMax: _randInt(20, 40),
      warmEmailRampup: _randInt(1, 3),
      deliverabilityScore: _randInt(75, 99),
      spamRate: Math.round(_rand() * 5 * 100) / 100,
      inboxRate: _randInt(85, 99),
    },
    health: {
      dkim: _rand() > 0.1,
      spf: _rand() > 0.1,
      dmarc: _rand() > 0.2,
      customTrackingDomain: _rand() > 0.4,
      score: _randInt(60, 100),
    },
    createdAt: _daysAgo(_randInt(30, 365)),
  });
}

// ═══════════════════════════════════════════════════════════════════
//  MEETING TYPES (5)
// ═══════════════════════════════════════════════════════════════════

export const meetingTypes = [
  { id: "met_01", teamId: "tea_mock01", userId: "usr_m04", name: "Discovery Call", duration: 30, color: "#7ac3ff", type: "default", status: "active", privacy: "public", description: "Quick intro call to learn about your needs." },
  { id: "met_02", teamId: "tea_mock01", userId: "usr_m05", name: "Product Demo", duration: 45, color: "#d7a6fc", type: "default", status: "active", privacy: "public", description: "Deep dive into our platform." },
  { id: "met_03", teamId: "tea_mock01", userId: "usr_m12", name: "Team Sync", duration: 15, color: "#fea668", type: "default", status: "active", privacy: "team", description: "Internal team sync." },
  { id: "met_04", teamId: "tea_mock01", userId: null, name: "Group Demo", duration: 60, color: "#72d699", type: "group", status: "active", privacy: "public", description: "Group demo for multiple prospects.", maxAttendees: 10 },
  { id: "met_05", teamId: "tea_mock01", userId: null, name: "Sales Call (Round Robin)", duration: 30, color: "#ff99ab", type: "roundRobin", status: "active", privacy: "public", description: "First available AE takes the call.", roundRobinMembers: ["usr_m04", "usr_m05", "usr_m06", "usr_m10"] },
];

// ═══════════════════════════════════════════════════════════════════
//  MEETINGS (35 booked)
// ═══════════════════════════════════════════════════════════════════

_seed = 6500;
const MEETING_STATUSES = ["confirmed", "canceled", "completed", "noShow"];

export const meetings = [];
for (let i = 0; i < 35; i++) {
  const contact = contacts[_randInt(0, contacts.length - 1)];
  const mt = meetingTypes[_randInt(0, 2)]; // mostly 1:1
  const host = team.find(m => m.id === mt.userId) || _pick(team);
  const daysFromNow = _randInt(-30, 14);
  const hour = _randInt(9, 17);
  const start = new Date(NOW);
  start.setDate(start.getDate() + daysFromNow);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + mt.duration);
  const isPast = daysFromNow < 0;

  meetings.push({
    id: `mee_${String(i + 1).padStart(3, "0")}`,
    teamId: "tea_mock01",
    meetingTypeId: mt.id,
    meetingTypeName: mt.name,
    hostId: host.id,
    hostName: `${host.firstName} ${host.lastName}`,
    hostEmail: host.email,
    contactId: contact.id,
    contactName: contact.name,
    contactEmail: contact.email,
    companyName: contact.companyName,
    start: start.toISOString(),
    end: end.toISOString(),
    duration: mt.duration,
    status: isPast ? _wpick(MEETING_STATUSES, [10, 10, 70, 10]) : _wpick(["confirmed", "canceled"], [85, 15]),
    location: _pick(["Google Meet", "Zoom", "Microsoft Teams", "Phone call"]),
    notes: isPast && _rand() > 0.5 ? _pick(["Good conversation, interested in a trial.", "Not a fit right now, revisit in Q3.", "Needs budget approval from VP.", "Very engaged, sending proposal."]) : null,
    cancelReason: null,
    createdAt: _daysAgo(Math.abs(daysFromNow) + _randInt(1, 7)),
    attendees: [
      { name: `${host.firstName} ${host.lastName}`, email: host.email, type: "host", response: "accepted" },
      { name: contact.name, email: contact.email, type: "guest", response: isPast ? "accepted" : _pick(["accepted", "tentative", "needsAction"]) },
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════
//  PHONE NUMBERS (6)
// ═══════════════════════════════════════════════════════════════════

export const phoneNumbers = [
  { id: "pnu_01", userId: "usr_m01", teamId: "tea_mock01", phoneNumber: "+33 1 23 45 67 89", label: "Main FR", status: "active", type: "callerId", sms: true, smsLimit: 100, recordCalls: true },
  { id: "pnu_02", userId: "usr_m02", teamId: "tea_mock01", phoneNumber: "+33 1 98 76 54 32", label: "SDR Line", status: "active", type: "callerId", sms: true, smsLimit: 80, recordCalls: true },
  { id: "pnu_03", userId: "usr_m04", teamId: "tea_mock01", phoneNumber: "+1 415 555 0123", label: "US Line", status: "active", type: "callerId", sms: false, smsLimit: 0, recordCalls: true },
  { id: "pnu_04", userId: "usr_m08", teamId: "tea_mock01", phoneNumber: "+44 20 7946 0958", label: "UK Line", status: "active", type: "callerId", sms: true, smsLimit: 50, recordCalls: false },
  { id: "pnu_05", userId: null, teamId: "tea_mock01", phoneNumber: "+33 1 55 55 55 55", label: "Team Inbound", status: "active", type: "incoming", sms: false, smsLimit: 0, recordCalls: true, forwardedTo: "+33 1 23 45 67 89" },
  { id: "pnu_06", userId: "usr_m11", teamId: "tea_mock01", phoneNumber: "+55 11 98765 4321", label: "Brazil Line", status: "active", type: "callerId", sms: true, smsLimit: 60, recordCalls: true },
];

// ═══════════════════════════════════════════════════════════════════
//  UNSUBSCRIBES (30)
// ═══════════════════════════════════════════════════════════════════

_seed = 7000;
export const unsubscribes = [];
for (let i = 0; i < 30; i++) {
  const contact = contacts[_randInt(0, contacts.length - 1)];
  unsubscribes.push({
    id: `uns_${String(i + 1).padStart(3, "0")}`,
    teamId: "tea_mock01",
    value: contact.email,
    source: _wpick(["lead", "user", "api", "bounced", "abuse"], [40, 25, 15, 15, 5]),
    createdAt: _daysAgo(_randInt(1, 90)),
    createdBy: _rand() > 0.5 ? _pick(team).id : null,
  });
}

// ═══════════════════════════════════════════════════════════════════
//  WEBHOOKS (4)
// ═══════════════════════════════════════════════════════════════════

export const webhooks = [
  { id: "whk_01", teamId: "tea_mock01", url: "https://hooks.zapier.com/hooks/catch/123456/abcdef/", events: ["emailsReplied", "emailsInterested"], active: true, createdBy: "usr_m12", createdAt: _daysAgo(60) },
  { id: "whk_02", teamId: "tea_mock01", url: "https://api.hubspot.com/webhooks/v3/trigger", events: ["emailsSent", "emailsOpened", "emailsReplied", "meetingBooked"], active: true, createdBy: "usr_m12", createdAt: _daysAgo(45) },
  { id: "whk_03", teamId: "tea_mock01", url: "https://n8n.acme.io/webhook/lemlist-sync", events: ["emailsBounced", "emailsUnsubscribed"], active: true, createdBy: "usr_m05", createdAt: _daysAgo(30) },
  { id: "whk_04", teamId: "tea_mock01", url: "https://old-integration.example.com/hook", events: ["emailsReplied"], active: false, createdBy: "usr_m04", createdAt: _daysAgo(120) },
];

// ═══════════════════════════════════════════════════════════════════
//  API KEYS (3)
// ═══════════════════════════════════════════════════════════════════

export const apiKeys = [
  { id: "apk_01", teamId: "tea_mock01", name: "Production API", shortKey: "lml_...x7k2", createdBy: "usr_m12", createdAt: _daysAgo(90), lastUsedAt: _daysAgo(0) },
  { id: "apk_02", teamId: "tea_mock01", name: "Zapier Integration", shortKey: "lml_...m3p9", createdBy: "usr_m12", createdAt: _daysAgo(60), lastUsedAt: _daysAgo(2) },
  { id: "apk_03", teamId: "tea_mock01", name: "Dev/Testing", shortKey: "lml_...t1s5", createdBy: "usr_m05", createdAt: _daysAgo(15), lastUsedAt: _daysAgo(5) },
];

// ═══════════════════════════════════════════════════════════════════
//  NOTIFICATIONS (20)
// ═══════════════════════════════════════════════════════════════════

_seed = 7500;
const NOTIF_TEMPLATES = [
  { text: "{{contact}} replied to your email in {{campaign}}", icon: "reply", subType: "reply" },
  { text: "{{contact}} opened your email", icon: "eye", subType: "open" },
  { text: "{{contact}} clicked a link in your email", icon: "mousePointerClick", subType: "click" },
  { text: "{{contact}} booked a meeting — {{meetingType}}", icon: "calendar", subType: "meeting" },
  { text: "{{contact}} unsubscribed from {{campaign}}", icon: "xCircle", subType: "unsubscribe" },
  { text: "Your email to {{contact}} bounced", icon: "alertTriangle", subType: "bounce" },
  { text: "Campaign {{campaign}} has been paused — daily limit reached", icon: "hand", subType: "limit" },
  { text: "New lead added to {{campaign}} via API", icon: "plus", subType: "newLead" },
  { text: "{{member}} assigned you a task for {{contact}}", icon: "clipboard", subType: "task" },
  { text: "Warmup score for {{mailbox}} dropped below 80", icon: "alertTriangle", subType: "warmup" },
];

export const notifications = [];
for (let i = 0; i < 20; i++) {
  const tmpl = NOTIF_TEMPLATES[i % NOTIF_TEMPLATES.length];
  const contact = _pick(contacts);
  const camp = _pick(campaigns);
  const member = _pick(team);

  notifications.push({
    id: `not_${String(i + 1).padStart(3, "0")}`,
    userId: _pick(team).id,
    text: tmpl.text
      .replace("{{contact}}", contact.name)
      .replace("{{campaign}}", camp.rawName || camp.name)
      .replace("{{meetingType}}", _pick(meetingTypes).name)
      .replace("{{member}}", `${member.firstName} ${member.lastName}`)
      .replace("{{mailbox}}", mailboxes[0]?.email || ""),
    icon: tmpl.icon,
    subType: tmpl.subType,
    new: i < 5,
    createdAt: _daysAgo(i < 3 ? 0 : _randInt(1, 14)),
    url: tmpl.subType === "reply" ? `/inbox/${contact.id}` : tmpl.subType === "meeting" ? "/meetings" : `/campaigns/${camp.id}`,
  });
}

// ═══════════════════════════════════════════════════════════════════
//  WATCH LISTS & SIGNALS (3 lists, 15 signals)
// ═══════════════════════════════════════════════════════════════════

export const watchLists = [
  { id: "wat_01", teamId: "tea_mock01", name: "Job Changes — Target Accounts", status: "active", entity: "contact", type: "jobChange", signalCount: 8, createdBy: "usr_m04", createdAt: _daysAgo(30) },
  { id: "wat_02", teamId: "tea_mock01", name: "Funding Rounds — SaaS", status: "active", entity: "company", type: "funding", signalCount: 5, createdBy: "usr_m12", createdAt: _daysAgo(45) },
  { id: "wat_03", teamId: "tea_mock01", name: "LinkedIn Post Engagement", status: "paused", entity: "contact", type: "linkedinPost", signalCount: 2, createdBy: "usr_m05", createdAt: _daysAgo(20) },
];

_seed = 8000;
export const watchListSignals = [];
for (let i = 0; i < 15; i++) {
  const wl = watchLists[i % watchLists.length];
  const contact = _pick(contacts);
  watchListSignals.push({
    id: `wls_${String(i + 1).padStart(3, "0")}`,
    watchListId: wl.id,
    teamId: "tea_mock01",
    entity: wl.entity,
    contactId: wl.entity === "contact" ? contact.id : null,
    companyId: wl.entity === "company" ? contact.companyId : contact.companyId,
    contactName: contact.name,
    companyName: contact.companyName,
    signalType: wl.type,
    title: wl.type === "jobChange" ? `${contact.firstName} changed role to ${_pick(JOB_TITLES)}`
         : wl.type === "funding" ? `${contact.companyName} raised ${_pick(["$5M", "$12M", "$25M", "$50M"])} Series ${_pick(["A", "B", "C"])}`
         : `${contact.firstName} posted about ${_pick(["AI", "sales", "growth", "hiring", "product launch"])}`,
    detectedAt: _daysAgo(_randInt(0, 30)),
    processed: _rand() > 0.4,
  });
}

// ═══════════════════════════════════════════════════════════════════
//  COPILOT / AI (3 conversations, 12 messages)
// ═══════════════════════════════════════════════════════════════════

export const copilotConversations = [
  { id: "ccv_01", teamId: "tea_mock01", userId: "usr_m01", title: "Help me write a cold email for SaaS founders", messageCount: 4, createdAt: _daysAgo(5) },
  { id: "ccv_02", teamId: "tea_mock01", userId: "usr_m04", title: "Analyze my campaign performance", messageCount: 5, createdAt: _daysAgo(3) },
  { id: "ccv_03", teamId: "tea_mock01", userId: "usr_m12", title: "Create a multichannel sequence for enterprise", messageCount: 3, createdAt: _daysAgo(1) },
];

export const copilotMessages = [
  // Conversation 1
  { id: "cpm_01", conversationId: "ccv_01", role: "user", content: "Help me write a cold email targeting SaaS founders who recently raised funding.", createdAt: _daysAgo(5) },
  { id: "cpm_02", conversationId: "ccv_01", role: "assistant", content: "Here's a personalized email template:\n\n**Subject:** Congrats on the raise, {{firstName}}!\n\n**Body:**\nHi {{firstName}},\n\nSaw that {{companyName}} just closed a round — congrats! 🎉\n\nAs you scale, outbound becomes critical. We help post-funding SaaS teams like yours book 40% more meetings in the first 90 days.\n\nWorth a quick 15-min chat?\n\nBest,\n{{senderName}}", createdAt: _daysAgo(5) },
  { id: "cpm_03", conversationId: "ccv_01", role: "user", content: "Can you make it shorter and more casual?", createdAt: _daysAgo(5) },
  { id: "cpm_04", conversationId: "ccv_01", role: "assistant", content: "**Subject:** Quick congrats 🎉\n\n**Body:**\nHey {{firstName}},\n\nCongrats on the raise! If scaling outbound is on the roadmap, we should chat — we help teams like {{companyName}} book way more meetings, fast.\n\n15 min this week?\n\n{{senderName}}", createdAt: _daysAgo(5) },
  // Conversation 2
  { id: "cpm_05", conversationId: "ccv_02", role: "user", content: "Which of my campaigns has the best reply rate?", createdAt: _daysAgo(3) },
  { id: "cpm_06", conversationId: "ccv_02", role: "assistant", content: "Based on your data, here are your top campaigns by reply rate:\n\n1. **Inbound MQL Nurture** — 11.2% reply rate (600 contacted)\n2. **Event Follow-up SaaStr** — 9.8% reply rate (180 contacted)\n3. **LinkedIn ABM Enterprise** — 8.5% reply rate (250 contacted)\n\nThe Inbound MQL campaign is performing well because inbound leads are already warm. Want me to analyze what's working in the sequence?", createdAt: _daysAgo(3) },
  { id: "cpm_07", conversationId: "ccv_02", role: "user", content: "Yes, what steps are driving the most replies?", createdAt: _daysAgo(3) },
  { id: "cpm_08", conversationId: "ccv_02", role: "assistant", content: "Looking at the Inbound MQL Nurture sequence:\n\n- **Step 1 (Welcome email)** — 7.2% reply rate ← strongest\n- **Step 3 (WhatsApp check-in)** — 6.1% reply rate\n- **Step 2 (Value prop email)** — 3.8% reply rate\n\nThe WhatsApp step is punching above its weight. Consider adding more WhatsApp touchpoints to your other campaigns.", createdAt: _daysAgo(3) },
  { id: "cpm_09", conversationId: "ccv_02", role: "user", content: "How does my team compare?", createdAt: _daysAgo(3) },
  { id: "cpm_10", conversationId: "ccv_02", role: "assistant", content: "Here's your team breakdown:\n\n| Rep | Contacted | Reply Rate | Interested |\n|-----|-----------|------------|------------|\n| Alice M. | 1,200 | 8.1% | 42 |\n| Thomas B. | 1,050 | 6.2% | 31 |\n| Sofia G. | 980 | 9.3% ⭐ | 38 |\n| Nathan R. | 870 | 5.8% | 22 |\n\nSofia has the best reply rate despite lower volume. Her LinkedIn voice notes have a 12% reply rate — might be worth sharing her approach with the team.", createdAt: _daysAgo(3) },
  // Conversation 3
  { id: "cpm_11", conversationId: "ccv_03", role: "user", content: "Create a 6-step multichannel sequence for enterprise prospects in DACH.", createdAt: _daysAgo(1) },
  { id: "cpm_12", conversationId: "ccv_03", role: "assistant", content: "Here's a 6-step enterprise DACH sequence:\n\n1. **LinkedIn Profile Visit** (Day 0)\n2. **LinkedIn Connection Request** (Day 1) — \"Hi {{firstName}}, I follow {{companyName}}'s growth in the DACH market...\"\n3. **Email** (Day 3) — Formal intro with local case study\n4. **LinkedIn Voice Note** (Day 6) — 30s personalized note in English/German\n5. **Email** (Day 9) — ROI-focused follow-up\n6. **Phone Call** (Day 12) — Executive discovery call\n\nShall I generate the full copy for each step?", createdAt: _daysAgo(1) },
];

// ═══════════════════════════════════════════════════════════════════
//  BILLING & CREDITS
// ═══════════════════════════════════════════════════════════════════

export const billing = {
  teamId: "tea_mock01",
  plan: "Scale",
  billingCycle: "annual",
  seats: { used: 12, total: 15 },
  credits: {
    emailVerification: { used: 2340, total: 5000, resetDate: _daysAgo(-12) },
    emailFinder: { used: 890, total: 2500, resetDate: _daysAgo(-12) },
    phoneFinder: { used: 120, total: 500, resetDate: _daysAgo(-12) },
    aiTokens: { used: 45000, total: 100000, resetDate: _daysAgo(-12) },
  },
  licenses: team.map(m => ({
    userId: m.id,
    userName: `${m.firstName} ${m.lastName}`,
    product: "lemlist",
    assignedAt: _daysAgo(_randInt(30, 365)),
  })),
  invoices: [
    { id: "inv_01", number: "INV-2026-001", amount: 4188, currency: "USD", status: "paid", date: _daysAgo(60), pdfUrl: "#" },
    { id: "inv_02", number: "INV-2026-002", amount: 4188, currency: "USD", status: "paid", date: _daysAgo(30), pdfUrl: "#" },
    { id: "inv_03", number: "INV-2026-003", amount: 4188, currency: "USD", status: "upcoming", date: _daysAgo(-1), pdfUrl: null },
  ],
};

// ═══════════════════════════════════════════════════════════════════
//  ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════════════

export const roles = [
  { id: "rol_01", teamId: "tea_mock01", name: "Owner", defaultRole: false, permissions: ["*"] },
  { id: "rol_02", teamId: "tea_mock01", name: "Admin", defaultRole: false, permissions: ["campaigns.*", "contacts.*", "companies.*", "reports.*", "settings.*", "team.invite", "team.remove", "billing.view"] },
  { id: "rol_03", teamId: "tea_mock01", name: "Member", defaultRole: true, permissions: ["campaigns.view", "campaigns.edit", "contacts.view", "contacts.edit", "companies.view", "reports.view", "inbox.*"] },
  { id: "rol_04", teamId: "tea_mock01", name: "Viewer", defaultRole: false, permissions: ["campaigns.view", "contacts.view", "companies.view", "reports.view"] },
];

// ═══════════════════════════════════════════════════════════════════
//  TEAM (full, with roles and CRM sync)
// ═══════════════════════════════════════════════════════════════════

export const teamFull = {
  id: "tea_mock01",
  name: "Acme Sales",
  createdAt: _daysAgo(365),
  creatorDomain: "acme.io",
  pictureId: null,
  members: team.map((m, i) => ({
    ...m,
    roleId: i === 11 ? "rol_01" : i < 4 ? "rol_03" : i < 8 ? "rol_03" : "rol_03",
    avatar: `${m.firstName[0]}${m.lastName[0]}`,
    lastLoginAt: _daysAgo(_randInt(0, 7)),
    joinedAt: _daysAgo(_randInt(30, 365)),
    status: "active",
  })),
  invitedUsers: [
    { email: "newbie@acme.io", role: "rol_03", invitedBy: "usr_m12", invitedAt: _daysAgo(2) },
  ],
  crmSync: {
    hubspot: { connected: true, lastSyncAt: _daysAgo(0), contactsSynced: 620, dealsSynced: 45 },
    salesforce: { connected: false, lastSyncAt: null, contactsSynced: 0, dealsSynced: 0 },
    pipedrive: { connected: false, lastSyncAt: null },
  },
  settings: {
    timezone: "Europe/Paris",
    language: "en",
    trackOpens: true,
    trackClicks: true,
    customUnsubscribeUrl: null,
    autoReviewEnabled: true,
    deduplicateAcrossCampaigns: true,
  },
};

// ═══════════════════════════════════════════════════════════════════
//  ENRICHMENT RESULTS (sample)
// ═══════════════════════════════════════════════════════════════════

_seed = 8500;
export const enrichmentResults = contacts.slice(0, 30).map((c, i) => ({
  id: `enr_${String(i + 1).padStart(3, "0")}`,
  contactId: c.id,
  teamId: "tea_mock01",
  status: _wpick(["found", "partial", "notFound"], [60, 25, 15]),
  emailFound: _rand() > 0.2 ? c.email : null,
  emailStatus: _wpick(["deliverable", "risky", "undeliverable"], [70, 20, 10]),
  phoneFound: _rand() > 0.6 ? c.phone : null,
  linkedinFound: _rand() > 0.3 ? c.linkedinUrl : null,
  provider: _pick(["dropcontact", "findymail", "prospeo", "datagma", "icypeas"]),
  creditsUsed: _randInt(1, 3),
  enrichedAt: _daysAgo(_randInt(0, 60)),
}));

// ═══════════════════════════════════════════════════════════════════
//  AI COMPANY DESCRIPTIONS (5 sample ICPs)
// ═══════════════════════════════════════════════════════════════════

export const aiCompanyDescriptions = [
  {
    id: "acd_01", teamId: "tea_mock01", companyName: "Acme Sales", emailDomain: "acme.io",
    mainActivity: "Sales engagement platform for outbound teams",
    shortDescription: "Acme helps B2B sales teams automate multichannel outreach and book more meetings.",
    icps: [
      { title: "VP Sales at Mid-Market SaaS", description: "Manages 5-20 SDRs, needs to scale outbound without hiring", companySize: ["51-200", "201-500"], industries: ["SaaS", "MarTech"], locations: ["US", "Europe"] },
      { title: "SDR Manager at Growth-Stage Startup", description: "Building outbound motion for the first time", companySize: ["11-50", "51-200"], industries: ["SaaS", "FinTech", "DevTools"], locations: ["US", "Europe", "LATAM"] },
      { title: "Revenue Ops Lead", description: "Optimizing sales stack and processes", companySize: ["201-500", "501-1000"], industries: ["SaaS", "Analytics"], locations: ["US"] },
    ],
    personas: [
      { jobTitle: "VP of Sales", equivalents: ["Head of Sales", "Sales Director", "CRO"] },
      { jobTitle: "SDR Manager", equivalents: ["BDR Manager", "Inside Sales Manager"] },
      { jobTitle: "RevOps Manager", equivalents: ["Revenue Operations Lead", "Sales Operations Manager"] },
    ],
    painPoints: [
      "Low reply rates on cold outreach",
      "Too many tools, no unified workflow",
      "SDR ramp time is too long",
      "Can't track multichannel performance",
    ],
    valueProps: [
      "3x reply rates with multichannel sequences",
      "All-in-one platform (email + LinkedIn + calls + SMS)",
      "AI-powered personalization at scale",
      "Built-in deliverability tools",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
//  CONTACT EXPERIENCES (work history, 50 samples)
// ═══════════════════════════════════════════════════════════════════

_seed = 9000;
export const contactExperiences = [];
for (let i = 0; i < 50; i++) {
  const contact = contacts[i % contacts.length];
  const comp = _pick(companies);
  const yearsAgo = _randInt(0, 8);
  contactExperiences.push({
    id: `cxp_${String(i + 1).padStart(3, "0")}`,
    teamId: "tea_mock01",
    contactId: contact.id,
    companyId: comp.id,
    companyName: comp.name,
    companyPicture: null,
    title: _pick(JOB_TITLES),
    primary: i % 3 === 0,
    dateFrom: `${2026 - yearsAgo - _randInt(1, 4)}-${String(_randInt(1, 12)).padStart(2, "0")}`,
    dateTo: yearsAgo === 0 ? null : `${2026 - yearsAgo}-${String(_randInt(1, 12)).padStart(2, "0")}`,
  });
}

// ═══════════════════════════════════════════════════════════════════
//  COMPOSER DRAFTS (5)
// ═══════════════════════════════════════════════════════════════════

_seed = 9200;
export const composerDrafts = [];
for (let i = 0; i < 5; i++) {
  const contact = contacts[_randInt(0, contacts.length - 1)];
  const author = _pick(team);
  composerDrafts.push({
    id: `cdr_${String(i + 1).padStart(3, "0")}`,
    teamId: "tea_mock01",
    contactId: contact.id,
    contactName: contact.name,
    userId: author.id,
    channel: _pick(["email", "linkedin"]),
    subject: i % 2 === 0 ? `Re: Quick question about ${contact.companyName}` : null,
    content: _pick(["Thanks for the reply! I'd love to schedule a call...", "Following up on our conversation...", "Here's the case study I mentioned..."]),
    attachments: [],
    createdAt: _daysAgo(_randInt(0, 7)),
  });
}

// ═══════════════════════════════════════════════════════════════════
//  ASYNC EXPORTS (recent CSV exports)
// ═══════════════════════════════════════════════════════════════════

export const asyncExports = [
  { id: "axp_01", teamId: "tea_mock01", type: "contacts", status: "done", progress: 100, fileName: "contacts-export-2026-03-15.csv", rowCount: 850, createdBy: "usr_m12", createdAt: _daysAgo(4), url: "#" },
  { id: "axp_02", teamId: "tea_mock01", type: "campaign_leads", campaignId: "cmp_01", status: "done", progress: 100, fileName: "saas-decision-makers-leads.csv", rowCount: 800, createdBy: "usr_m01", createdAt: _daysAgo(2), url: "#" },
  { id: "axp_03", teamId: "tea_mock01", type: "activities", status: "processing", progress: 67, fileName: "activities-export.csv", rowCount: null, createdBy: "usr_m05", createdAt: _daysAgo(0), url: null },
];

// ═══════════════════════════════════════════════════════════════════
//  REPORTS DASHBOARDS (existing dashboard configs)
// ═══════════════════════════════════════════════════════════════════

export const reportsDashboards = [
  { id: "rpd_01", teamId: "tea_mock01", name: "Main Dashboard", createdBy: "usr_m12", shared: true, widgets: 8, createdAt: _daysAgo(60) },
  { id: "rpd_02", teamId: "tea_mock01", name: "Call Performance", createdBy: "usr_m11", shared: true, widgets: 5, createdAt: _daysAgo(30) },
  { id: "rpd_03", teamId: "tea_mock01", name: "Alice's View", createdBy: "usr_m01", shared: false, widgets: 4, createdAt: _daysAgo(15) },
];

// ═══════════════════════════════════════════════════════════════════
//  SUMMARY (console-friendly)
// ═══════════════════════════════════════════════════════════════════

export const summary = {
  // Core CRM
  teamSize: team.length,
  companyCount: companies.length,
  contactCount: contacts.length,
  customFieldCount: customFields.length,
  crmStatusCount: crmStatuses.length,
  crmListCount: crmLists.length,

  // Campaigns & Outreach
  campaignCount: campaigns.length,
  campaignFolderCount: campaignFolders.length,
  sequenceCount: sequences.length,
  emailTemplateCount: emailTemplates.length,
  snippetCount: snippets.length,
  scheduleCount: schedules.length,
  leadCount: leads.length,

  // Activities
  activityCount: activities.length,
  recordCount: records.length,
  taskCount: tasks.length,

  // Inbox & Conversations
  inboxThreadCount: inboxThreads.length,
  opportunityCount: opportunities.length,
  composerDraftCount: composerDrafts.length,

  // Calendar
  meetingTypeCount: meetingTypes.length,
  meetingCount: meetings.length,

  // Deliverability
  mailboxCount: mailboxes.length,

  // AI
  copilotConversationCount: copilotConversations.length,
  copilotMessageCount: copilotMessages.length,

  // Settings
  phoneNumberCount: phoneNumbers.length,
  unsubscribeCount: unsubscribes.length,
  webhookCount: webhooks.length,
  apiKeyCount: apiKeys.length,
  notificationCount: notifications.length,
  watchListCount: watchLists.length,
  watchListSignalCount: watchListSignals.length,
  enrichmentResultCount: enrichmentResults.length,
  contactExperienceCount: contactExperiences.length,

  // Date range
  dateRange: { start: activities[0]?.createdAt.toISOString().split("T")[0], end: activities[activities.length - 1]?.createdAt.toISOString().split("T")[0] },

  // Channel breakdown
  channelBreakdown: Object.fromEntries(
    ["email", "linkedin", "call", "sms", "whatsapp", "api", "manual"].map(ch => [
      ch, activities.filter(a => !a.bot && (STEP_TO_CHANNEL[a.stepType] || "email") === ch).length
    ])
  ),
};
