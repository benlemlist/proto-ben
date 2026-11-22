// Signals (watch lists) — catalog copied from prod (lemapp/imports/lemlist/watch-list/watch-list-conf.ts)
// + the 11 new signals of the Rodz sprint / Ads engagement (Notion FEATURE-5118, 5137…5150).
// Icons are FontAwesome Kit names, the same as prod (`fa-regular fa-<icon>`).

export type Entity = "company" | "contact";
export type SegmentType = "all" | "list" | "csv";
export type GroupId = "buyer-intent" | "people-moves" | "company-growth" | "crm-signal" | "social-activity" | "in-house-events" | "company-news";

export const fa = (name: string) => `fa-regular fa-${name}`;
export const faBrand = (name: string) => `fa-brands fa-${name}`;

export interface Group { id: GroupId; title: string; description: string; icon: string; badge: "sky" | "pink" | "success" | "orange" | "indigo" | "fuchsia" | "neutral" }

// WATCH_LIST_INTENT_GROUPS_DEFINITIONS + WATCH_LIST_INTENT_GROUP_BADGE_INTENTS
export const GROUPS: Group[] = [
  { id: "buyer-intent", title: "Buyer intent", description: "Catch prospects actively evaluating solutions", icon: fa("crosshairs"), badge: "sky" },
  { id: "people-moves", title: "People moves", description: "Time your outreach to career changes", icon: fa("person-walking-arrow-right"), badge: "pink" },
  { id: "company-growth", title: "Company growth", description: "Target companies that are scaling up", icon: fa("chart-line"), badge: "success" },
  { id: "crm-signal", title: "CRM signal", description: "Monitor signals coming from your connected CRM", icon: fa("address-book"), badge: "orange" },
  { id: "social-activity", title: "Social activity", description: "Monitor LinkedIn activity in real-time", icon: fa("hashtag"), badge: "indigo" },
  { id: "in-house-events", title: "In-house events", description: "Pipe your own events (product analytics, company events, website lead magnets...) into lemlist", icon: fa("calendar"), badge: "fuchsia" },
  { id: "company-news", title: "Company news", description: "Real-time business events from public sources (Explorium)", icon: fa("newspaper"), badge: "neutral" },
];

export type NewSignalId =
  | "adsEngagement" | "competitorCustomerCare" | "employeeDeparture" | "aiAdoption" | "techDisplacement"
  | "dormantLinkedinPoster" | "eventAttendees" | "forecastedFunding" | "forecastedIpo" | "forecastedAcquisition" | "forecastedGrowth";

export interface SignalType {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  group: GroupId;
  entity: Entity;
  /** Credits per signal. `null` = billed like Website visitors. */
  credits: number | null;
  /** New signal of this project (not in prod yet). */
  isNew?: boolean;
  /** Notion status of the opportunity. */
  status?: "Next" | "Idea";
  feature?: string;
  /** Forecast family: no step-1 config, heat score + AI analysis. */
  forecast?: boolean;
  segments: SegmentType[];
  /** Has the "Identification limit" slider on the Scope step (all but Website visitors-like). */
  hasLimit: boolean;
  /** Can source contacts with a persona (company signal pushed to a campaign). */
  personaSourcing: boolean;
  comingSoon?: boolean;
}

const company = (x: Omit<SignalType, "entity" | "segments" | "hasLimit" | "personaSourcing"> & Partial<SignalType>): SignalType =>
  ({ entity: "company", segments: ["all", "list", "csv"], hasLimit: true, personaSourcing: true, ...x });
const contact = (x: Omit<SignalType, "entity" | "segments" | "hasLimit" | "personaSourcing"> & Partial<SignalType>): SignalType =>
  ({ entity: "contact", segments: ["all", "list", "csv"], hasLimit: true, personaSourcing: false, ...x });

// Prod catalog (titles, descriptions, icons, groups as in WATCH_LIST_SIGNAL_CONFIGURATIONS)
const PROD: SignalType[] = [
  company({ id: "companyEmployeeVisitedMyWebsite", title: "Website visitors", shortTitle: "Website visitors", description: "Identify companies visiting your website and engage the right contacts.", icon: fa("globe"), group: "buyer-intent", credits: null, segments: ["all"], hasLimit: false }),
  company({ id: "customSignals", title: "AI Signals", shortTitle: "AI Signals", description: "Create custom signals. AI monitors the web so you don’t have to.", icon: fa("sparkles"), group: "buyer-intent", credits: 100 }),
  company({ id: "competitorConnections", title: "Competitor connections", shortTitle: "Competitor connections", description: "Know when prospects connect with competitors on LinkedIn.", icon: fa("circle-nodes"), group: "buyer-intent", credits: 50, segments: ["all"] }),
  company({ id: "technologyChange", title: "Technology change", shortTitle: "Tech change", description: "Get alerted when companies adopt, drop, or switch technologies.", icon: fa("microchip"), group: "buyer-intent", credits: 100 }),
  company({ id: "personBuyingIntent", title: "Social buying intent", shortTitle: "Social buying intent", description: "People asking their network for a solution like yours.", icon: fa("user-magnifying-glass"), group: "buyer-intent", credits: 50 }),
  company({ id: "buyingIntent", title: "Bombora Buying intent", shortTitle: "Buying intent", description: "Companies researching topics related to your offer.", icon: fa("basket-shopping"), group: "buyer-intent", credits: 100 }),
  company({ id: "githubStargazer", title: "GitHub Activity", shortTitle: "GitHub", description: "Developers starring the repositories you track.", icon: faBrand("github"), group: "buyer-intent", credits: 50 }),
  contact({ id: "jobChange", title: "Job change", shortTitle: "Changed jobs", description: "Detect when key contacts switch companies — the best window to reach out.", icon: fa("briefcase"), group: "people-moves", credits: 50 }),
  company({ id: "warmIntros", title: "Warm Intros", shortTitle: "Warm Intros", description: "Spot decision-makers your team or clients can introduce you to.", icon: fa("handshake"), group: "people-moves", credits: 50 }),
  company({ id: "newHire", title: "New hire", shortTitle: "New hire", description: "Spot new decision-makers joining target companies within their first 90 days.", icon: fa("id-card-clip"), group: "people-moves", credits: 100 }),
  company({ id: "promotion", title: "Promotion", shortTitle: "Promotion", description: "Know when contacts get promoted — new budget and new priorities.", icon: fa("person-arrow-up-from-line"), group: "people-moves", credits: 100 }),
  company({ id: "companyIsHiring", title: "Company is hiring", shortTitle: "Job posting", description: "Monitor job postings from target companies to identify growth areas.", icon: fa("user-plus"), group: "company-growth", credits: 100 }),
  company({ id: "companyRaisedFunds", title: "Fundraising", shortTitle: "Company raised funds", description: "Get alerted when companies raise funding rounds — fresh budget means new tools.", icon: fa("hand-holding-dollar"), group: "company-growth", credits: 100 }),
  company({ id: "recruitmentCampaign", title: "Hiring Campaign", shortTitle: "Hiring campaign", description: "Companies opening many positions at once.", icon: fa("briefcase"), group: "company-growth", credits: 100 }),
  company({ id: "mergersAcquisitions", title: "Mergers & acquisitions", shortTitle: "Mergers & Acquisitions", description: "Track M&A activity — combined entities re-evaluate their tech stack.", icon: fa("bags-shopping"), group: "company-growth", credits: 100 }),
  company({ id: "companyRunningAds", title: "Company running ads", shortTitle: "Running ads", description: "Companies investing in paid acquisition.", icon: fa("bullhorn"), group: "company-growth", credits: 50 }),
  company({ id: "marketExpansion", title: "Market expansion", shortTitle: "Market expansion", description: "Identify companies expanding into new geographic markets.", icon: fa("globe"), group: "company-growth", credits: 50 }),
  company({ id: "closedWonLookalike", title: "Closed-won lookalikes", shortTitle: "Won lookalike", description: "Companies similar to your recently closed-won deals.", icon: fa("trophy"), group: "crm-signal", credits: 50 }),
  contact({ id: "competitorReactions", title: "Competitor reactions", shortTitle: "Competitor reactions", description: "People reacting to your competitors' LinkedIn posts.", icon: faBrand("linkedin"), group: "social-activity", credits: 50, segments: ["all"] }),
  contact({ id: "linkedinPeopleProfile", title: "Influencer engagement", shortTitle: "LinkedIn profiles", description: "Spot people engaging with industry influencers' content.", icon: faBrand("linkedin"), group: "social-activity", credits: 50, segments: ["all"] }),
  contact({ id: "linkedinCompanyProfile", title: "Company page engagement", shortTitle: "LinkedIn company profile", description: "Track who engages with specific company pages' posts.", icon: faBrand("linkedin"), group: "social-activity", credits: 50, segments: ["all"] }),
  contact({ id: "linkedinKeywords", title: "LinkedIn keywords", shortTitle: "LinkedIn keywords", description: "Track posts mentioning specific keywords or topics.", icon: faBrand("linkedin"), group: "social-activity", credits: 50, segments: ["all"] }),
  company({ id: "linkedinProfileViews", title: "LinkedIn profile views", shortTitle: "Profile view", description: "Know when prospects view your LinkedIn profile.", icon: fa("eye"), group: "social-activity", credits: 50 }),
  contact({ id: "externalSignalContact", title: "Contact external signals", shortTitle: "External Signal (Contact)", description: "Send your own contact events to lemlist through the API.", icon: fa("plug"), group: "in-house-events", credits: 0 }),
  company({ id: "externalSignalCompany", title: "Company external signals", shortTitle: "External Signal (Company)", description: "Send your own company events to lemlist through the API.", icon: fa("plug"), group: "in-house-events", credits: 0 }),
  company({ id: "newProductLaunch", title: "New product launch", shortTitle: "New product launch", description: "New products need new go-to-market tools.", icon: fa("gift"), group: "company-news", credits: 50 }),
  company({ id: "companyAward", title: "Awards & recognition", shortTitle: "Awards & recognition", description: "A great conversation opener and sign of momentum.", icon: fa("trophy"), group: "company-news", credits: 50 }),
  company({ id: "newPartnership", title: "New partnership", shortTitle: "New partnership", description: "Expanding ecosystems and fresh vendor opportunities.", icon: fa("handshake"), group: "company-news", credits: 50 }),
  company({ id: "newOffice", title: "New office opening", shortTitle: "New office opening", description: "Geographic expansion — new offices need new tools and vendors.", icon: fa("building"), group: "company-news", credits: 50 }),
  company({ id: "costCutting", title: "Cost cutting", shortTitle: "Cost cutting", description: "Companies cutting costs may be open to more efficient alternatives.", icon: fa("scissors"), group: "company-news", credits: 50 }),
];

// The 11 new signals. Copy written in the prod tone (one sentence, the "why now" after the dash).
const NEW: SignalType[] = [
  company({ id: "adsEngagement", isNew: true, status: "Next", feature: "FEATURE-5118", title: "Ads engagement", shortTitle: "Ads engagement", description: "Identify companies that clicked your ads and landed on your website.", icon: fa("rectangle-ad"), group: "buyer-intent", credits: null, segments: ["all"], hasLimit: false }),
  contact({ id: "competitorCustomerCare", isNew: true, status: "Next", feature: "FEATURE-5142", title: "Competitor customer care", shortTitle: "Competitor care", description: "Know when prospects connect with your competitors' support and success teams.", icon: fa("headset"), group: "buyer-intent", credits: 100, segments: ["all"] }),
  company({ id: "techDisplacement", isNew: true, status: "Next", feature: "FEATURE-5137", title: "Tech displacement", shortTitle: "Tech displacement", description: "Know when companies drop a tool — they're shopping for a replacement.", icon: fa("arrow-right-arrow-left"), group: "buyer-intent", credits: 100, segments: ["all"] }),
  company({ id: "aiAdoption", isNew: true, status: "Next", feature: "FEATURE-5139", title: "AI adoption", shortTitle: "AI adoption", description: "Spot companies adopting AI tools — they're open to new ways of working.", icon: fa("microchip-ai"), group: "buyer-intent", credits: 100, segments: ["all"] }),
  company({ id: "employeeDeparture", isNew: true, status: "Idea", feature: "FEATURE-5140", title: "Employee departure", shortTitle: "Employee departure", description: "Know when a key role leaves a company — the gap opens a buying window.", icon: fa("user-minus"), group: "people-moves", credits: 100, segments: ["all"] }),
  company({ id: "forecastedFunding", isNew: true, forecast: true, status: "Next", feature: "FEATURE-5145", title: "Forecasted fundraising", shortTitle: "Forecasted fundraising", description: "Reach companies likely to raise soon — before the round, not after.", icon: fa("hand-holding-dollar"), group: "company-growth", credits: 100 }),
  company({ id: "forecastedIpo", isNew: true, forecast: true, status: "Next", feature: "FEATURE-5146", title: "Forecasted IPO", shortTitle: "Forecasted IPO", description: "Companies preparing to go public — compliance and scale projects ahead.", icon: fa("building-columns"), group: "company-growth", credits: 100 }),
  company({ id: "forecastedAcquisition", isNew: true, forecast: true, status: "Next", feature: "FEATURE-5148", title: "Forecasted acquisition", shortTitle: "Forecasted acquisition", description: "Companies likely to be acquired — their stack is about to be reviewed.", icon: fa("bags-shopping"), group: "company-growth", credits: 100 }),
  company({ id: "forecastedGrowth", isNew: true, forecast: true, status: "Idea", feature: "FEATURE-5150", title: "Forecasted growth", shortTitle: "Forecasted growth", description: "Companies about to scale their teams — new budget is coming.", icon: fa("arrow-trend-up"), group: "company-growth", credits: 100 }),
  contact({ id: "dormantLinkedinPoster", isNew: true, status: "Next", feature: "FEATURE-5143", title: "LinkedIn comeback", shortTitle: "LinkedIn comeback", description: "Decision-makers posting again after months of silence — they're back and listening.", icon: faBrand("linkedin"), group: "social-activity", credits: 50, segments: ["all"] }),
  contact({ id: "eventAttendees", isNew: true, status: "Next", feature: "FEATURE-5144", title: "Event attendees", shortTitle: "Event attendees", description: "Reach people attending the events your buyers go to.", icon: fa("calendar-star"), group: "social-activity", credits: 50, segments: ["all"] }),
];

export const SIGNAL_TYPES: SignalType[] = [...PROD, ...NEW];
export const signalType = (id: string) => SIGNAL_TYPES.find((s) => s.id === id)!;
export const NEW_IDS = NEW.map((s) => s.id);

// ─── Step 1 configuration (filters) — one shape per signal family ──────────────
export interface AgentConfig {
  // Ads engagement
  website?: string;
  adPlatforms?: string[];
  pagesTracked?: string;
  minDuration?: string;
  minPages?: string;
  // Competitor care
  companyUrls?: string[];
  profileUrls?: string[];
  trackedRoles?: string[];
  // Tech displacement / AI adoption
  trackBy?: "tool" | "category";
  tools?: string[];
  categories?: string[];
  // Employee departure / LinkedIn comeback
  jobTitles?: string[];
  deliverCompany?: boolean;
  reactivationGapDays?: number;
  // Event attendees
  eventUrls?: string[];
  includeEngagers?: boolean;
  engagementTypes?: string[];
}

export const DEFAULT_CONFIG: Record<string, AgentConfig> = {
  adsEngagement: { adPlatforms: [], pagesTracked: "", minDuration: "0", minPages: "1" },
  competitorCustomerCare: { companyUrls: [], profileUrls: [], trackedRoles: ["customer_success", "support"] },
  techDisplacement: { trackBy: "tool", tools: [], categories: [] },
  aiAdoption: { tools: [], categories: [] },
  employeeDeparture: { jobTitles: [], deliverCompany: true },
  dormantLinkedinPoster: { jobTitles: [], reactivationGapDays: 75 },
  eventAttendees: { eventUrls: [], includeEngagers: false, engagementTypes: ["likes", "comments"] },
};

export const AD_PLATFORMS = [
  { value: "linkedin", label: "LinkedIn Ads", clickId: "li_fat_id" },
  { value: "google", label: "Google Ads", clickId: "gclid" },
  { value: "meta", label: "Meta Ads", clickId: "fbclid" },
  { value: "tiktok", label: "TikTok Ads", clickId: "ttclid" },
  { value: "x", label: "X Ads", clickId: "twclid" },
];

export const CARE_ROLES = [
  { value: "customer_success", label: "Customer success" },
  { value: "support", label: "Support" },
  { value: "account_management", label: "Account management" },
  { value: "onboarding", label: "Onboarding & implementation" },
];

export const TECH_CATALOG = [
  { value: "HubSpot", category: "CRM" }, { value: "Salesforce", category: "CRM" }, { value: "Pipedrive", category: "CRM" },
  { value: "Outreach", category: "Sales engagement" }, { value: "Salesloft", category: "Sales engagement" }, { value: "Apollo", category: "Sales engagement" },
  { value: "Zendesk", category: "Customer support" }, { value: "Intercom", category: "Customer support" }, { value: "Freshdesk", category: "Customer support" },
  { value: "Marketo", category: "Marketing automation" }, { value: "Pardot", category: "Marketing automation" }, { value: "Mailchimp", category: "Email marketing" },
  { value: "Gong", category: "Conversation intelligence" }, { value: "Chorus", category: "Conversation intelligence" },
  { value: "ZoomInfo", category: "Data provider" }, { value: "Lusha", category: "Data provider" }, { value: "Cognism", category: "Data provider" },
];
export const TECH_CATEGORIES = [...new Set(TECH_CATALOG.map((t) => t.category))];

export const AI_CATALOG = [
  { value: "ChatGPT Enterprise", category: "AI assistant" }, { value: "Claude for Work", category: "AI assistant" }, { value: "Microsoft Copilot", category: "AI assistant" }, { value: "Gemini for Workspace", category: "AI assistant" },
  { value: "Clay", category: "AI sales" }, { value: "Lavender", category: "AI sales" }, { value: "Regie.ai", category: "AI sales" },
  { value: "Intercom Fin", category: "AI customer support" }, { value: "Decagon", category: "AI customer support" },
  { value: "Cursor", category: "AI coding" }, { value: "GitHub Copilot", category: "AI coding" },
  { value: "Otter.ai", category: "AI meeting notes" }, { value: "Fireflies", category: "AI meeting notes" },
  { value: "Jasper", category: "AI writing" }, { value: "Writer", category: "AI writing" },
];
export const AI_CATEGORIES = [...new Set(AI_CATALOG.map((t) => t.category))];

export const JOB_TITLE_SUGGESTIONS = ["VP Sales", "Head of Sales", "Chief Revenue Officer", "RevOps Manager", "VP Marketing", "Head of Growth", "CTO", "Head of Customer Success"];

export const INDUSTRIES = ["Software Development", "IT Services and IT Consulting", "Financial Services", "Advertising Services", "Staffing and Recruiting", "Marketing Services", "Hospitals and Health Care", "E-Learning Providers"];
export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"];
export const COUNTRIES = ["France", "United States", "United Kingdom", "Germany", "Spain", "Belgium", "Netherlands", "Canada"];

export const TRACKED_WEBSITES = ["lemlist.com", "lemcal.com"];
export const CRM_LISTS = [
  { id: "l1", name: "Tier 1 accounts — EMEA", count: 412 },
  { id: "l2", name: "Open opportunities (HubSpot)", count: 86 },
  { id: "l3", name: "Churned customers 2026", count: 153 },
];
export const PERSONAS = [
  { id: "p1", name: "Sales leaders", description: "VP Sales, Head of Sales, CRO" },
  { id: "p2", name: "RevOps", description: "RevOps Manager, Sales Ops" },
  { id: "p3", name: "Marketing leaders", description: "VP Marketing, Head of Growth" },
];
export const CAMPAIGNS = ["Signals — Tech switchers Q1", "Fundraising follow-up", "Outbound EMEA — SaaS"];
export const TEAM = [
  { id: "u1", name: "Benjamin Martin", initials: "BM" },
  { id: "u2", name: "Etienne Durand", initials: "ED" },
  { id: "u3", name: "Lea Moreau", initials: "LM" },
];

export const DAILY_LIMIT = { min: 1, max: 100, ranges: [5, 20, 50], default: 20, customMax: 1000 };

export const PROCESSING = [
  { id: "manual", label: "Review signals manually", shortLabel: "Manual", description: "Review and handle each signal yourself", icon: fa("hand") },
  { id: "task", label: "Auto-create tasks", shortLabel: "Task creation", description: "Automatically create a task for each signal", icon: fa("list-check") },
  { id: "campaign", label: "Auto-push to campaign", shortLabel: "Push to campaign", description: "Automatically enroll leads into a campaign", icon: fa("paper-plane-top") },
] as const;
export type ProcessingId = (typeof PROCESSING)[number]["id"];

export const WIZARD_STEPS = ["Configure your signal", "Scope", "Signal processing", "Summary"];

// ─── Agents & signals (mock) ───────────────────────────────────────────────────
export type AgentStatus = "live" | "paused" | "draft";

export interface Filters { industries: { in: string[]; out: string[] }; sizes: { in: string[]; out: string[] }; locations: { in: string[]; out: string[] }; jobTitles: { in: string[]; out: string[] } }
export const emptyFilters = (): Filters => ({ industries: { in: [], out: [] }, sizes: { in: [], out: [] }, locations: { in: [], out: [] }, jobTitles: { in: [], out: [] } });

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  type: string;
  status: AgentStatus;
  config: AgentConfig;
  segmentType: SegmentType;
  crmListIds: string[];
  csvFile?: string;
  filters: Filters;
  dailyLimit: number;
  processing: ProcessingId;
  personaId?: string;
  campaign?: string;
  createdAt: string;
  ownerId: string;
}

export interface Company { name: string; domain: string; industry: string; size: string; country: string; city: string; employees: number; founded: number; description: string }
export interface Person { firstName: string; lastName: string; title: string; email: string; location: string }

export type SignalStatus = "new" | "old" | "handled" | "ignored";
export interface Signal {
  id: string;
  agentId: string;
  type: string;
  status: SignalStatus;
  detectedAt: string; // ISO
  company: Company;
  contact?: Person;
  /** Type-specific data shown in "Signal details". */
  data: Record<string, string | number | string[] | undefined>;
}

export const COMPANIES: Company[] = [
  { name: "Qonto", domain: "qonto.com", industry: "Financial Services", size: "1001-5000", country: "France", city: "Paris", employees: 1600, founded: 2016, description: "Business account and financial management for SMEs and freelancers." },
  { name: "Pennylane", domain: "pennylane.com", industry: "Software Development", size: "501-1000", country: "France", city: "Paris", employees: 700, founded: 2020, description: "Accounting and financial management platform for SMEs and accountants." },
  { name: "Swile", domain: "swile.co", industry: "Software Development", size: "501-1000", country: "France", city: "Montpellier", employees: 650, founded: 2018, description: "Employee benefits and meal voucher platform." },
  { name: "Spendesk", domain: "spendesk.com", industry: "Financial Services", size: "201-500", country: "France", city: "Paris", employees: 450, founded: 2016, description: "Spend management software for finance teams." },
  { name: "Aircall", domain: "aircall.io", industry: "Software Development", size: "501-1000", country: "France", city: "Paris", employees: 750, founded: 2014, description: "Cloud-based phone system for sales and support teams." },
  { name: "Malt", domain: "malt.com", industry: "Staffing and Recruiting", size: "501-1000", country: "France", city: "Paris", employees: 600, founded: 2013, description: "Freelance marketplace connecting companies with independent experts." },
  { name: "Personio", domain: "personio.com", industry: "Software Development", size: "1001-5000", country: "Germany", city: "Munich", employees: 1900, founded: 2015, description: "HR software for small and medium-sized companies." },
  { name: "Pleo", domain: "pleo.io", industry: "Financial Services", size: "501-1000", country: "Denmark", city: "Copenhagen", employees: 850, founded: 2015, description: "Company cards and expense management." },
  { name: "Factorial", domain: "factorialhr.com", industry: "Software Development", size: "1001-5000", country: "Spain", city: "Barcelona", employees: 1200, founded: 2016, description: "All-in-one HR software for SMEs." },
  { name: "Typeform", domain: "typeform.com", industry: "Software Development", size: "201-500", country: "Spain", city: "Barcelona", employees: 480, founded: 2012, description: "Conversational forms and surveys." },
  { name: "Brevo", domain: "brevo.com", industry: "Software Development", size: "501-1000", country: "France", city: "Paris", employees: 900, founded: 2012, description: "Email, SMS and CRM platform for growing businesses." },
  { name: "Alan", domain: "alan.com", industry: "Financial Services", size: "501-1000", country: "France", city: "Paris", employees: 600, founded: 2016, description: "Health insurance for companies and individuals." },
];

export const PEOPLE: Person[] = [
  { firstName: "Camille", lastName: "Laurent", title: "VP Sales", email: "camille.laurent@", location: "Paris, France" },
  { firstName: "Hugo", lastName: "Bernard", title: "Head of Customer Success", email: "hugo.bernard@", location: "Lyon, France" },
  { firstName: "Sarah", lastName: "Klein", title: "RevOps Manager", email: "sarah.klein@", location: "Berlin, Germany" },
  { firstName: "Lucas", lastName: "Petit", title: "Chief Revenue Officer", email: "lucas.petit@", location: "Paris, France" },
  { firstName: "Emma", lastName: "Rossi", title: "Head of Growth", email: "emma.rossi@", location: "Milan, Italy" },
  { firstName: "Noah", lastName: "Garcia", title: "Sales Director", email: "noah.garcia@", location: "Barcelona, Spain" },
  { firstName: "Julie", lastName: "Martin", title: "VP Marketing", email: "julie.martin@", location: "Paris, France" },
];
