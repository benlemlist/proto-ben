// PeopleDB suggested lists (FEATURE-5060): company profiles, the lists lemAgent suggests, and a deterministic lead generator.
// V1 = "Built for you" (ICP lists) + "Fresh from signals" (hiring, job change, tech adoption, renewals). Niche lists = coming soon.

export const fa = (name: string) => `fa-regular fa-${name}`;

/** The user's company profile (context center). Switchable from the proto commands to show lists adapting. */
export interface Profile {
  id: string;
  company: string;
  pitch: string;
  /** Short ICP summary shown in "Manage preferences". */
  icp: string[];
}

export const PROFILES: Profile[] = [
  {
    id: "sales-tool",
    company: "Cadencio",
    pitch: "Sales engagement software for B2B teams",
    icp: ["B2B SaaS & agencies", "11–500 employees", "US, France, UK, DACH", "Heads of Sales, VPs Sales, Founders"],
  },
  {
    id: "cyber",
    company: "Sentrail",
    pitch: "Cloud security posture for mid-market companies",
    icp: ["Software, Fintech, Healthtech", "200–2,000 employees", "US, UK, Nordics", "CISOs, Heads of Security, CTOs"],
  },
];

export type SignalKind = "hiring" | "jobChange" | "techAdoption" | "renewal";

export const SIGNALS: Record<SignalKind, { label: string; icon: string; badge: "success" | "info" | "amber" }> = {
  hiring: { label: "Hiring", icon: fa("briefcase"), badge: "success" },
  jobChange: { label: "Job change", icon: fa("arrow-right-arrow-left"), badge: "info" },
  techAdoption: { label: "New tool", icon: fa("layer-plus"), badge: "amber" },
  renewal: { label: "Upcoming renewal", icon: fa("arrows-rotate"), badge: "amber" },
};

export interface Criterion { label: string; value: string }

export interface SuggestedList {
  id: string;
  section: "icp" | "signal";
  signal?: SignalKind;
  title: string;
  description: string;
  /** Why it matters (shown at the top of the list view). */
  why: string;
  leadCount: number;
  /** ICP lists only. */
  fit?: number;
  /** Signal lists only: hours since the list was refreshed. */
  hoursAgo?: number;
  isNew?: boolean;
  criteria: Criterion[];
  titles: string[];
  industries: string[];
  locations: string[];
  sizes: string[];
}

const L = (l: Omit<SuggestedList, "id"> & { id?: string }, i: number, p: string): SuggestedList => ({ id: l.id ?? `${p}-${l.section}-${i}`, ...l });

const SALES_ICP: Omit<SuggestedList, "id">[] = [
  {
    section: "icp", fit: 96, leadCount: 1284,
    title: "Heads of Sales at US B2B SaaS",
    description: "51–200 employees, same profile as your best customers.",
    why: "Your 20 best customers are US SaaS companies of this size. These leads share their industry, size and buyer title.",
    criteria: [{ label: "Job title", value: "Head of Sales, VP Sales" }, { label: "Industry", value: "Software Development" }, { label: "Headcount", value: "51–200" }, { label: "Location", value: "United States" }],
    titles: ["Head of Sales", "VP Sales", "Head of Sales North America"], industries: ["Software Development"], locations: ["New York, US", "Austin, US", "San Francisco, US", "Boston, US", "Denver, US"], sizes: ["51–200"],
  },
  {
    section: "icp", fit: 92, leadCount: 3410,
    title: "Founders of seed-stage startups in Europe",
    description: "2–20 employees, no sales team yet: the founder sells.",
    why: "Founders who sell themselves are 31% of your signups last quarter. They pick a tool fast and grow seats with the team.",
    criteria: [{ label: "Job title", value: "Founder, Co-founder, CEO" }, { label: "Headcount", value: "2–20" }, { label: "Sales team", value: "None" }, { label: "Location", value: "France, Germany, UK, Spain" }],
    titles: ["Founder & CEO", "Co-founder", "CEO"], industries: ["Software Development", "Fintech", "Marketing Services"], locations: ["Paris, FR", "Berlin, DE", "London, UK", "Barcelona, ES", "Lyon, FR"], sizes: ["2–10", "11–20"],
  },
  {
    section: "icp", fit: 88, leadCount: 2150,
    title: "Sales Directors at agencies in France",
    description: "10–200 employees, marketing and recruitment agencies.",
    why: "Agencies run outbound for their own pipeline and often for clients. French agencies convert 1.4× above your average.",
    criteria: [{ label: "Job title", value: "Sales Director, Business Developer" }, { label: "Industry", value: "Marketing, Staffing & Recruiting" }, { label: "Headcount", value: "10–200" }, { label: "Location", value: "France" }],
    titles: ["Directeur Commercial", "Sales Director", "Head of Business Development"], industries: ["Marketing Services", "Staffing & Recruiting"], locations: ["Paris, FR", "Lyon, FR", "Nantes, FR", "Bordeaux, FR", "Lille, FR"], sizes: ["11–50", "51–200"],
  },
];

const SALES_SIGNALS: Omit<SuggestedList, "id">[] = [
  {
    section: "signal", signal: "hiring", hoursAgo: 3, leadCount: 64,
    title: "Heads of Sales at companies hiring SDRs",
    description: "38 companies in your ICP posted SDR or BDR roles in the last 7 days.",
    why: "A team hiring SDRs is building outbound now. They need tooling before the new reps start.",
    criteria: [{ label: "Job posts", value: "SDR, BDR, AE · last 7 days" }, { label: "Job title", value: "Head of Sales, VP Sales" }, { label: "Company", value: "In your ICP" }],
    titles: ["Head of Sales", "VP Sales", "Sales Manager"], industries: ["Software Development", "Fintech"], locations: ["Paris, FR", "London, UK", "New York, US", "Berlin, DE"], sizes: ["51–200", "201–500"],
  },
  {
    section: "signal", signal: "jobChange", hoursAgo: 9, leadCount: 41,
    title: "New VPs of Sales in their first 90 days",
    description: "New sales leaders rebuild their stack early. 41 started a role recently.",
    why: "New leaders rebuild their stack in their first 90 days. Classic buying window.",
    criteria: [{ label: "Job change", value: "Last 30–90 days" }, { label: "New title", value: "VP Sales, CRO, Head of Sales" }, { label: "Company", value: "In your ICP" }],
    titles: ["VP Sales", "Chief Revenue Officer", "Head of Sales"], industries: ["Software Development"], locations: ["New York, US", "London, UK", "Amsterdam, NL", "Paris, FR"], sizes: ["51–200", "201–500"],
  },
  {
    section: "signal", signal: "techAdoption", hoursAgo: 22, leadCount: 57,
    title: "Companies that just adopted HubSpot",
    description: "HubSpot detected in the last 30 days at 31 companies in your ICP.",
    why: "A new CRM means budget unlocked and a sales stack being built. You sync natively with HubSpot.",
    criteria: [{ label: "Technology", value: "HubSpot Sales Hub · new" }, { label: "Detected", value: "Last 30 days" }, { label: "Job title", value: "Head of Sales, RevOps" }],
    titles: ["Head of Sales", "RevOps Manager", "Marketing Director"], industries: ["Software Development", "Marketing Services"], locations: ["Austin, US", "Paris, FR", "Madrid, ES", "Dublin, IE"], sizes: ["11–50", "51–200"],
  },
  {
    section: "signal", signal: "renewal", hoursAgo: 46, leadCount: 23,
    title: "Teams whose Outreach contract renews this quarter",
    description: "Outreach installs with an estimated renewal in the next 90 days.",
    why: "Renewal windows are the best time to pitch an alternative. Reach the buyer before they sign again.",
    criteria: [{ label: "Technology", value: "Outreach · installed" }, { label: "Est. renewal", value: "Next 90 days" }, { label: "Job title", value: "VP Sales, RevOps" }],
    titles: ["VP Sales", "Head of Revenue Operations", "Sales Enablement Lead"], industries: ["Software Development", "Fintech"], locations: ["San Francisco, US", "London, UK", "Toronto, CA", "New York, US"], sizes: ["201–500", "501–1,000"],
  },
];

const CYBER_ICP: Omit<SuggestedList, "id">[] = [
  {
    section: "icp", fit: 95, leadCount: 860,
    title: "CISOs at US fintechs",
    description: "200–2,000 employees, regulated and on AWS or GCP.",
    why: "Fintechs under audit are your fastest deals. These CISOs match your 12 best accounts.",
    criteria: [{ label: "Job title", value: "CISO, VP Security" }, { label: "Industry", value: "Fintech" }, { label: "Headcount", value: "200–2,000" }, { label: "Location", value: "United States" }],
    titles: ["CISO", "VP Security", "Head of Information Security"], industries: ["Fintech"], locations: ["New York, US", "Chicago, US", "San Francisco, US"], sizes: ["201–500", "501–1,000", "1,001–2,000"],
  },
  {
    section: "icp", fit: 90, leadCount: 1420,
    title: "CTOs at healthtech scale-ups in the UK",
    description: "No dedicated security leader yet: the CTO owns it.",
    why: "Without a CISO, the CTO buys security tooling. HIPAA and NHS audits create urgency.",
    criteria: [{ label: "Job title", value: "CTO, VP Engineering" }, { label: "Industry", value: "Healthtech" }, { label: "Security team", value: "None" }, { label: "Location", value: "United Kingdom" }],
    titles: ["CTO", "VP Engineering", "Head of Platform"], industries: ["Healthtech"], locations: ["London, UK", "Cambridge, UK", "Oxford, UK"], sizes: ["201–500"],
  },
  {
    section: "icp", fit: 84, leadCount: 610,
    title: "Heads of Security at Nordic SaaS",
    description: "200–1,000 employees, multi-cloud.",
    why: "Nordic SaaS companies are moving to multi-cloud and need one view of their posture.",
    criteria: [{ label: "Job title", value: "Head of Security" }, { label: "Industry", value: "Software Development" }, { label: "Location", value: "Sweden, Denmark, Norway, Finland" }],
    titles: ["Head of Security", "Security Engineering Manager"], industries: ["Software Development"], locations: ["Stockholm, SE", "Copenhagen, DK", "Oslo, NO", "Helsinki, FI"], sizes: ["201–500", "501–1,000"],
  },
];

const CYBER_SIGNALS: Omit<SuggestedList, "id">[] = [
  {
    section: "signal", signal: "hiring", hoursAgo: 5, leadCount: 48,
    title: "CTOs at companies hiring cloud security engineers",
    description: "29 companies in your ICP posted cloud security roles this week.",
    why: "Hiring a security engineer means the problem is on the roadmap now. Tooling comes with the hire.",
    criteria: [{ label: "Job posts", value: "Cloud Security Engineer · last 7 days" }, { label: "Job title", value: "CTO, CISO" }],
    titles: ["CTO", "CISO", "VP Engineering"], industries: ["Software Development", "Fintech"], locations: ["London, UK", "New York, US", "Stockholm, SE"], sizes: ["201–500"],
  },
  {
    section: "signal", signal: "jobChange", hoursAgo: 11, leadCount: 33,
    title: "New CISOs in their first 90 days",
    description: "New security leaders audit the stack in their first quarter.",
    why: "A new CISO runs a full audit of the stack first. Classic buying window.",
    criteria: [{ label: "Job change", value: "Last 30–90 days" }, { label: "New title", value: "CISO, Head of Security" }],
    titles: ["CISO", "Head of Security"], industries: ["Fintech", "Healthtech"], locations: ["Chicago, US", "London, UK", "Boston, US"], sizes: ["501–1,000"],
  },
  {
    section: "signal", signal: "techAdoption", hoursAgo: 30, leadCount: 39,
    title: "Companies that just moved to GCP",
    description: "Google Cloud detected in the last 30 days next to an existing AWS stack.",
    why: "A second cloud doubles the attack surface. Posture tooling becomes a priority.",
    criteria: [{ label: "Technology", value: "Google Cloud · new" }, { label: "Also uses", value: "AWS" }],
    titles: ["CTO", "Head of Platform"], industries: ["Software Development"], locations: ["Austin, US", "London, UK"], sizes: ["201–500", "501–1,000"],
  },
];

export function listsFor(profileId: string): SuggestedList[] {
  const [icp, sig] = profileId === "cyber" ? [CYBER_ICP, CYBER_SIGNALS] : [SALES_ICP, SALES_SIGNALS];
  return [...icp.map((l, i) => L(l, i, profileId)), ...sig.map((l, i) => L(l, i, profileId))];
}

/** "New signals today" (proto command): one fresh list per run, cycling through these. */
export const FRESH_SIGNALS: Omit<SuggestedList, "id" | "hoursAgo">[] = [
  {
    section: "signal", signal: "hiring", leadCount: 18, isNew: true,
    title: "Sales leaders at companies opening a Paris office",
    description: "7 companies in your ICP posted their first sales roles in France today.",
    why: "A first sales hire in a new country means outbound is starting there, from scratch.",
    criteria: [{ label: "Job posts", value: "First sales role in France · today" }, { label: "Job title", value: "Head of Sales, Country Manager" }],
    titles: ["Country Manager France", "Head of Sales France"], industries: ["Software Development"], locations: ["Paris, FR"], sizes: ["51–200"],
  },
  {
    section: "signal", signal: "jobChange", leadCount: 12, isNew: true,
    title: "Your champions who just changed company",
    description: "12 contacts from your past campaigns joined a new company in your ICP.",
    why: "People who already know you open doors at their new company. Highest reply rates of any list.",
    criteria: [{ label: "Job change", value: "Last 14 days" }, { label: "Known contact", value: "In your past campaigns" }],
    titles: ["Head of Sales", "Sales Manager", "VP Sales"], industries: ["Software Development"], locations: ["London, UK", "Paris, FR", "Berlin, DE"], sizes: ["51–200"],
  },
];

export const COMING_SOON = [
  { id: "funding", label: "Funding", icon: fa("sack-dollar"), note: "Series A–B rounds" },
  { id: "followers", label: "Company followers", icon: fa("users"), note: "Paid, credits per lead" },
  { id: "warm", label: "Warm intros", icon: fa("handshake"), note: "Paid, your network" },
  { id: "mentions", label: "Competitor mentions", icon: fa("message-quote"), note: "Monitoring data" },
];

// ---------- Leads ----------

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  photo: string;
  /** Per-lead reason it is in the list (signal detail or ICP match). */
  reason: string;
}

const FIRST = ["Camille", "Lucas", "Emma", "Hugo", "Sarah", "Thomas", "Léa", "Julien", "Olivia", "James", "Mia", "Noah", "Sofia", "Daniel", "Chloé", "Max", "Hannah", "Ethan", "Inès", "Liam", "Clara", "Leo", "Amelia", "Nathan", "Jade", "Oscar", "Elena", "Victor", "Zoe", "Adam"];
const LAST = ["Martin", "Bernard", "Dubois", "Smith", "Johnson", "Müller", "Garcia", "Rossi", "Laurent", "Walker", "Schmidt", "Moreau", "Nguyen", "Clarke", "Fischer", "Lefebvre", "Brown", "Weber", "Fontaine", "Taylor", "Becker", "Roux", "Evans", "Kowalski", "Hughes"];
const CO = ["Pennylane", "Brevo", "Payfit", "Swile", "Qonto", "Aircall", "Spendesk", "Lemonway", "Agicap", "Pigment", "Livestorm", "Alan", "Malt", "Contentsquare", "Ornikar", "Ledgerly", "Northwind", "Brightwave", "Cobalt Labs", "Fieldnote", "Quillstack", "Tidal Ops", "Vantage Loop", "Orbitly", "Harborline", "Kitebase", "Mosaic HR", "Peakflow", "Sundial", "Ravenscale"];

/** Tiny deterministic PRNG, so a list always shows the same leads. */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];

const MONTHS = ["Aug", "Sep", "Oct", "Nov"];

function reasonFor(list: SuggestedList, r: () => number, company: string): string {
  const d = 1 + Math.floor(r() * 6);
  switch (list.signal) {
    case "hiring": { const n = 1 + Math.floor(r() * 4); return `${n} SDR/BDR role${n > 1 ? "s" : ""} posted · ${d}d ago`; }
    case "jobChange": return `Joined ${company} · ${pick(r, MONTHS)} ${1 + Math.floor(r() * 27)}`;
    case "techAdoption": return `${list.criteria[0].value.split(" · ")[0]} detected · ${d * 4}d ago`;
    case "renewal": return `Est. renewal · ${pick(r, ["Jan", "Feb", "Mar"])} 2027`;
    default: return pick(r, ["Same profile as 4 of your customers", "Looks like your best accounts", "Matches title, size and industry", "In a market you won deals in"]);
  }
}

/** First N leads of a list (the proto shows a page, the count says how many exist). */
export function leadsFor(list: SuggestedList, n = 40): Lead[] {
  const r = rng(list.id);
  return Array.from({ length: Math.min(n, list.leadCount) }, (_, i) => {
    const firstName = pick(r, FIRST);
    const lastName = pick(r, LAST);
    const company = pick(r, CO);
    return {
      id: `${list.id}-l${i}`,
      firstName,
      lastName,
      title: pick(r, list.titles),
      company,
      domain: `${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      industry: pick(r, list.industries),
      size: pick(r, list.sizes),
      location: pick(r, list.locations),
      photo: `https://i.pravatar.cc/96?img=${1 + Math.floor(r() * 70)}`,
      reason: reasonFor(list, r, company),
    };
  });
}

export const fmt = (n: number) => n.toLocaleString("en-US");

export function relHours(h: number): string {
  if (h < 1) return "Just now";
  if (h < 24) return `${Math.round(h)}h ago`;
  if (h < 48) return "Yesterday";
  return `${Math.floor(h / 24)} days ago`;
}
