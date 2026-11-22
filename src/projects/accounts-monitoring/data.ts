// Accounts list monitoring — create signals from a company list (Notion FEATURE-4869).
// Fake but realistic CRM data: European B2B SaaS accounts, CRM company lists, the signal types the agent can
// deploy on a list, and the existing watch lists (to show duplicate detection).

export const fa = (name: string) => `fa-regular fa-${name}`;
export const fmt = (n: number) => n.toLocaleString("en-US");

export type BadgeType = "info" | "success" | "critical" | "warning" | "neutral" | "orange" | "amber" | "teal" | "cyan" | "sky" | "indigo" | "violet" | "purple" | "fuchsia" | "pink";

// ─── Signal types ──────────────────────────────────────────────────────────────
export interface SignalDef {
  id: string;
  label: string;
  icon: string;
  badge: BadgeType;
  credits: number;
  /** Supports segmentType: 'list' today (prerequisite #1 of the opportunity). */
  supportsList: boolean;
  /** Expected signals per company per month (for the credits estimate). */
  rate: number;
}

export const SIGNALS: Record<string, SignalDef> = {
  companyIsHiring: { id: "companyIsHiring", label: "Company is hiring", icon: fa("user-plus"), badge: "success", credits: 100, supportsList: true, rate: 1.1 },
  technologyChange: { id: "technologyChange", label: "Technology change", icon: fa("microchip"), badge: "sky", credits: 100, supportsList: true, rate: 0.25 },
  promotion: { id: "promotion", label: "Promotion", icon: fa("person-arrow-up-from-line"), badge: "pink", credits: 100, supportsList: true, rate: 0.35 },
  marketExpansion: { id: "marketExpansion", label: "Market expansion", icon: fa("globe"), badge: "success", credits: 50, supportsList: true, rate: 0.12 },
  mergersAcquisitions: { id: "mergersAcquisitions", label: "Mergers & acquisitions", icon: fa("bags-shopping"), badge: "success", credits: 100, supportsList: true, rate: 0.04 },
  newOffice: { id: "newOffice", label: "New office", icon: fa("building"), badge: "neutral", credits: 50, supportsList: true, rate: 0.08 },
  costCutting: { id: "costCutting", label: "Cost cutting", icon: fa("scissors"), badge: "neutral", credits: 50, supportsList: true, rate: 0.06 },
  customSignals: { id: "customSignals", label: "AI signal", icon: fa("sparkles"), badge: "orange", credits: 100, supportsList: true, rate: 0.3 },
  companyRaisedFunds: { id: "companyRaisedFunds", label: "Fundraising", icon: fa("hand-holding-dollar"), badge: "success", credits: 100, supportsList: false, rate: 0.05 },
  newHire: { id: "newHire", label: "New hire", icon: fa("id-card-clip"), badge: "pink", credits: 100, supportsList: false, rate: 0.3 },
  competitorConnections: { id: "competitorConnections", label: "Competitor connections", icon: fa("circle-nodes"), badge: "indigo", credits: 50, supportsList: false, rate: 0.5 },
};
export const signal = (id: string) => SIGNALS[id];

// ─── Companies ─────────────────────────────────────────────────────────────────
export type CompanyStatus = "New" | "Lead" | "Opportunity" | "Customer" | "Evangelist";
export const STATUS_BADGE: Record<CompanyStatus, BadgeType> = { New: "info", Lead: "critical", Opportunity: "purple", Customer: "orange", Evangelist: "teal" };

export interface FiredSignal { type: string; daysAgo: number; detail: string }

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  country: string;
  status: CompanyStatus;
  owner: string;
  /** Suggested contacts (first one shown). */
  contact?: string;
  contactCount: number;
  lists: string[];
  fired: FiredSignal[];
  stack: string[];
}

type Row = [name: string, domain: string, industry: string, size: string, country: string, status: CompanyStatus, owner: string, contact: string | null, contactCount: number, lists: string, stack: string];

const ROWS: Row[] = [
  ["Qonto", "qonto.com", "Fintech", "1001-5000", "France", "Opportunity", "Lea Moreau", "Camille Laurent", 12, "tier1 fintech", "Salesforce, Outreach"],
  ["Pennylane", "pennylane.com", "SaaS", "501-1000", "France", "Lead", "Etienne Durand", "Hugo Bernard", 8, "tier1 q1", "HubSpot, Aircall"],
  ["Swile", "swile.co", "HR Tech", "501-1000", "France", "New", "Lea Moreau", null, 0, "tier1", "HubSpot"],
  ["Spendesk", "spendesk.com", "Fintech", "201-500", "France", "Customer", "Benjamin Martin", "Sarah Klein", 5, "tier1 fintech", "Salesforce, Gong"],
  ["Aircall", "aircall.io", "SaaS", "501-1000", "France", "Opportunity", "Etienne Durand", "Lucas Petit", 14, "tier1 q1", "Salesforce, Salesloft"],
  ["Malt", "malt.com", "Marketplace", "501-1000", "France", "New", "Lea Moreau", null, 0, "tier1", "HubSpot"],
  ["Personio", "personio.com", "HR Tech", "1001-5000", "Germany", "Lead", "Benjamin Martin", "Jonas Weber", 9, "tier1 q1", "Salesforce, Outreach"],
  ["Pleo", "pleo.io", "Fintech", "501-1000", "Denmark", "Evangelist", "Etienne Durand", "Freja Holm", 6, "tier1 fintech", "HubSpot, Gong"],
  ["Factorial", "factorialhr.com", "HR Tech", "1001-5000", "Spain", "Opportunity", "Lea Moreau", "Noah Garcia", 11, "tier1 q1", "HubSpot, Apollo"],
  ["Typeform", "typeform.com", "SaaS", "201-500", "Spain", "New", "Benjamin Martin", null, 0, "tier1", "Salesforce"],
  ["Brevo", "brevo.com", "Martech", "501-1000", "France", "Lead", "Etienne Durand", "Julie Martin", 7, "tier1 q1", "Salesforce, Outreach"],
  ["Alan", "alan.com", "Insurtech", "501-1000", "France", "Customer", "Lea Moreau", "Emma Rossi", 4, "tier1 fintech", "HubSpot"],
  ["Contentsquare", "contentsquare.com", "SaaS", "1001-5000", "France", "Opportunity", "Benjamin Martin", "Thomas Roux", 10, "tier1", "Salesforce, Gong"],
  ["Mirakl", "mirakl.com", "SaaS", "1001-5000", "France", "New", "Etienne Durand", null, 0, "tier1", "Salesforce"],
  ["Payfit", "payfit.com", "HR Tech", "501-1000", "France", "Lead", "Lea Moreau", "Ines Fabre", 6, "tier1 q1", "HubSpot, Lemlist"],
  ["Agicap", "agicap.com", "Fintech", "501-1000", "France", "Opportunity", "Benjamin Martin", "Paul Mercier", 8, "tier1 fintech q1", "HubSpot, Aircall"],
  ["Doctolib", "doctolib.com", "Healthtech", "1001-5000", "France", "New", "Etienne Durand", null, 0, "tier1", "Salesforce"],
  ["Pipedrive", "pipedrive.com", "SaaS", "501-1000", "Estonia", "Lead", "Lea Moreau", "Kristjan Tamm", 5, "tier1 q1", "Pipedrive"],
  ["Hivebrite", "hivebrite.com", "SaaS", "51-200", "France", "New", "Benjamin Martin", null, 0, "q1", "HubSpot"],
  ["Ornikar", "ornikar.com", "Insurtech", "201-500", "France", "Lead", "Etienne Durand", "Clara Dubois", 3, "q1", "HubSpot"],
  ["Lydia", "lydia-app.com", "Fintech", "201-500", "France", "New", "Lea Moreau", null, 0, "fintech", "Salesforce"],
  ["Ledger", "ledger.com", "Fintech", "501-1000", "France", "Opportunity", "Benjamin Martin", "Antoine Leroy", 7, "fintech", "Salesforce, Outreach"],
  ["Libeo", "libeo.io", "Fintech", "51-200", "France", "Lead", "Etienne Durand", "Marie Girard", 2, "fintech q1", "HubSpot"],
  ["Upflow", "upflow.io", "Fintech", "51-200", "France", "New", "Lea Moreau", null, 0, "fintech q1", "HubSpot, Apollo"],
  ["Swan", "swan.io", "Fintech", "51-200", "France", "Lead", "Benjamin Martin", "Nicolas Faure", 4, "fintech", "HubSpot"],
  ["Mooncard", "mooncard.co", "Fintech", "51-200", "France", "New", "Etienne Durand", null, 0, "fintech", "Pipedrive"],
  ["Livestorm", "livestorm.co", "SaaS", "201-500", "France", "Customer", "Lea Moreau", "Romain Blanc", 6, "q1", "HubSpot, Lemlist"],
  ["Dougs", "dougs.fr", "Fintech", "201-500", "France", "New", "Benjamin Martin", null, 0, "q1", "HubSpot"],
  ["Side", "side.co", "Staffing", "201-500", "France", "Lead", "Etienne Durand", "Laura Chevalier", 3, "q1", "Salesforce"],
  ["Matera", "matera.eu", "Proptech", "201-500", "France", "New", "Lea Moreau", null, 0, "q1", "HubSpot"],
  ["Welcome to the Jungle", "welcometothejungle.com", "HR Tech", "501-1000", "France", "Opportunity", "Benjamin Martin", "Maxime Perrin", 9, "", "Salesforce"],
  ["Algolia", "algolia.com", "SaaS", "501-1000", "France", "New", "Etienne Durand", null, 0, "", "Salesforce, Gong"],
  ["Back Market", "backmarket.com", "Marketplace", "501-1000", "France", "Lead", "Lea Moreau", "Sophie Lambert", 5, "", "Salesforce"],
  ["ManoMano", "manomano.com", "Marketplace", "501-1000", "France", "New", "Benjamin Martin", null, 0, "", "Salesforce"],
  ["Vestiaire Collective", "vestiairecollective.com", "Marketplace", "501-1000", "France", "Customer", "Etienne Durand", "Chloé Bonnet", 4, "", "HubSpot"],
  ["Sorare", "sorare.com", "Consumer", "201-500", "France", "New", "Lea Moreau", null, 0, "", "HubSpot"],
];

// Signals that already fired on these accounts (before the feature).
const FIRED: Record<string, FiredSignal[]> = {
  Qonto: [{ type: "companyIsHiring", daysAgo: 2, detail: "Hiring 6 Account Executives in Paris" }, { type: "technologyChange", daysAgo: 9, detail: "Added Gong to their stack" }],
  Spendesk: [{ type: "costCutting", daysAgo: 4, detail: "Announced a reorganisation of the sales team" }],
  Aircall: [{ type: "marketExpansion", daysAgo: 6, detail: "Opened a sales hub in Madrid" }, { type: "companyIsHiring", daysAgo: 11, detail: "Hiring 3 SDRs for the Spanish market" }],
  Personio: [{ type: "mergersAcquisitions", daysAgo: 13, detail: "Acquired the payroll startup Rollee" }],
  Pleo: [{ type: "newOffice", daysAgo: 3, detail: "New office in Lisbon" }],
  Factorial: [{ type: "companyIsHiring", daysAgo: 1, detail: "Hiring a Head of Sales DACH" }],
  Brevo: [{ type: "customSignals", daysAgo: 5, detail: "Mentioned outbound automation in their Q3 letter" }],
  Agicap: [{ type: "technologyChange", daysAgo: 8, detail: "Replaced Apollo with Outreach" }],
  Ledger: [{ type: "costCutting", daysAgo: 15, detail: "12% headcount reduction announced" }],
  Livestorm: [{ type: "promotion", daysAgo: 7, detail: "Romain Blanc promoted to VP Sales" }],
  Algolia: [{ type: "companyIsHiring", daysAgo: 4, detail: "Hiring 4 Enterprise AEs" }],
  "Back Market": [{ type: "mergersAcquisitions", daysAgo: 20, detail: "Acquired Ecoreco" }],
};

export const COMPANIES: Company[] = ROWS.map(([name, domain, industry, size, country, status, owner, contact, contactCount, lists, stack], i) => ({
  id: `co${i + 1}`,
  name, domain, industry, size, country, status, owner,
  contact: contact ?? undefined,
  contactCount,
  lists: lists.split(" ").filter(Boolean),
  fired: FIRED[name] ?? [],
  stack: stack.split(", "),
}));
export const company = (id: string) => COMPANIES.find((c) => c.id === id)!;

// ─── CRM company lists (tabs) ──────────────────────────────────────────────────
export interface CompanyList { id: string; name: string; /** null = "All companies" (not a CRM list). */ crm: boolean }
export const LISTS: CompanyList[] = [
  { id: "all", name: "All companies", crm: false },
  { id: "tier1", name: "Tier 1 accounts", crm: true },
  { id: "q1", name: "Q1 Growth", crm: true },
  { id: "fintech", name: "Fintech", crm: true },
];
export const companiesOf = (listId: string) => (listId === "all" ? COMPANIES : COMPANIES.filter((c) => c.lists.includes(listId)));

// ─── Watch lists (agents) ──────────────────────────────────────────────────────
export interface WatchList {
  id: string;
  name: string;
  type: string;
  /** Always 'list': no whole-segment monitoring from this flow. */
  segmentType: "list";
  listLabel: string;
  companyIds: string[];
  dailyLimit: number;
  processing: ProcessingId;
  createdBy: "you" | "lemAgent";
}

export const PROCESSING = [
  { id: "manual", label: "Review signals manually", short: "Manual review" },
  { id: "task", label: "Create a task for the account owner", short: "Task to owner" },
  { id: "campaign", label: "Push contacts to a campaign", short: "Push to campaign" },
] as const;
export type ProcessingId = (typeof PROCESSING)[number]["id"];

/** Existing agent, created before in the Signals page: monitors hiring on a part of Tier 1. */
export const EXISTING_WATCHLISTS: WatchList[] = [
  {
    id: "wl-existing-hiring",
    name: "Hiring · Tier 1 FR",
    type: "companyIsHiring",
    segmentType: "list",
    listLabel: "Tier 1 accounts (FR)",
    companyIds: ["co1", "co2", "co4", "co5", "co11", "co16"],
    dailyLimit: 20,
    processing: "task",
    createdBy: "you",
  },
];

// ─── V2: what the agent proposes for a scope ───────────────────────────────────
export interface Suggestion {
  id: string;
  type: string;
  name: string;
  why: string;
  /** Relevance 0–100 (scoringGuidance of the signal type vs. the accounts' profile). */
  score: number;
  /** Companies of the scope this agent will watch (already-monitored ones left out). */
  companyIds: string[];
  alreadyCovered: number;
  coveredBy?: string;
  enabled: boolean;
  dailyLimit: number;
  processing: ProcessingId;
}

export interface ScopeProfile { total: number; topIndustry: string; topIndustryCount: number; scaling: number; abroad: number; withStack: number; opportunities: number }

export function profileOf(ids: string[]): ScopeProfile {
  const cos = ids.map(company);
  const byIndustry = new Map<string, number>();
  cos.forEach((c) => byIndustry.set(c.industry, (byIndustry.get(c.industry) ?? 0) + 1));
  const [topIndustry, topIndustryCount] = [...byIndustry.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["SaaS", 0];
  return {
    total: cos.length,
    topIndustry,
    topIndustryCount,
    scaling: cos.filter((c) => ["201-500", "501-1000", "1001-5000"].includes(c.size)).length,
    abroad: cos.filter((c) => c.country !== "France").length,
    withStack: cos.filter((c) => c.stack.some((s) => ["Salesforce", "HubSpot", "Outreach", "Salesloft", "Apollo"].includes(s))).length,
    opportunities: cos.filter((c) => c.status === "Opportunity" || c.status === "Lead").length,
  };
}

export function suggestionsFor(ids: string[], watchlists: WatchList[]): Suggestion[] {
  const p = profileOf(ids);
  const covered = (type: string) => {
    const wls = watchlists.filter((w) => w.type === type);
    const set = new Set(wls.flatMap((w) => w.companyIds));
    return { ids: ids.filter((id) => set.has(id)), by: wls[0]?.name };
  };
  const make = (type: string, name: string, score: number, why: string): Suggestion => {
    const c = covered(type);
    const left = ids.filter((id) => !c.ids.includes(id));
    return {
      id: `sug-${type}`,
      type, name, why, score,
      companyIds: left,
      alreadyCovered: c.ids.length,
      coveredBy: c.by,
      enabled: score >= 60 && signal(type).supportsList && left.length > 0,
      dailyLimit: 20,
      processing: "task",
    };
  };
  const pct = (n: number) => `${n} of ${p.total}`;
  return [
    make("companyIsHiring", "Accounts hiring in sales", 92, `${pct(p.scaling)} are scaling (200 to 5,000 people). Sales job posts show which team gets new budget.`),
    make("technologyChange", "Sales stack changes", 84, `${pct(p.withStack)} run a CRM or sales engagement tool you can replace or plug into.`),
    make("promotion", "New sales leaders", 76, `${pct(p.opportunities)} are open leads or opportunities: a new VP Sales reopens the decision within 90 days.`),
    make("marketExpansion", "Expanding to new markets", p.abroad > 2 ? 68 : 52, `${pct(p.abroad)} are headquartered outside France and keep opening new countries.`),
    make("mergersAcquisitions", "Mergers & acquisitions", 41, "Rare on accounts this size: about 1 signal a year expected. Off by default."),
    make("companyRaisedFunds", "Fresh funding", 88, `Strong fit for ${p.topIndustry} accounts, but fundraising can't watch a list yet.`),
    make("newHire", "New decision makers", 81, "Strong fit, but new hires can't watch a list yet."),
  ];
}

export const estimate = (s: Pick<Suggestion, "type" | "companyIds">) => {
  const def = signal(s.type);
  const signals = s.companyIds.length ? Math.max(1, Math.round(s.companyIds.length * def.rate)) : 0;
  return { signals, credits: signals * def.credits };
};

// ─── V1: what Maxime L's iteration shows (Figma "Companies page", node 6714:68937) ─
export interface V1Card { id: string; name: string; badge: { label: string; icon: string; type: BadgeType }; selected: boolean }
export const V1_CARDS: V1Card[] = [
  { id: "v1-1", name: "Pre-seed raising companies", badge: { label: "Company raised funds", icon: fa("hand-holding-dollar"), type: "success" }, selected: true },
  { id: "v1-2", name: "Firing & cost-cutting companies", badge: { label: "Lawsuits and legal issues", icon: fa("gavel"), type: "neutral" }, selected: true },
  { id: "v1-3", name: "Decision maker promoting", badge: { label: "Promotion", icon: fa("person-arrow-up-from-line"), type: "pink" }, selected: false },
  { id: "v1-4", name: "New hire, new priorities", badge: { label: "Custom signal", icon: fa("sparkles"), type: "orange" }, selected: false },
];

/** First signals the deployed agents "find" (proto command). */
export const NEXT_SIGNALS: Record<string, string> = {
  companyIsHiring: "Hiring 2 SDRs and a Sales Ops Manager",
  technologyChange: "Started a trial of Salesloft",
  promotion: "New VP Sales appointed",
  marketExpansion: "Launched in Italy",
  mergersAcquisitions: "Acquired a smaller competitor",
};
