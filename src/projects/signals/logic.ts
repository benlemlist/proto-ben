// Mock signal generation + display helpers. Fields follow the "Side panel data" of each Notion spec.
import { COMPANIES, PEOPLE, AD_PLATFORMS, TECH_CATALOG, AI_CATALOG, signalType, type Agent, type Signal, type Company } from "./data";

let seq = 1;
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

const FORECAST_ANALYSIS: Record<string, string[]> = {
  forecastedFunding: [
    "Engineering headcount +38% in 6 months, mostly senior roles.",
    "Last round 22 months ago — the usual gap before a Series C.",
    "CFO and Head of Investor Relations hired this quarter.",
  ],
  forecastedIpo: [
    "Revenue run-rate above $200M with 3 years of profitability.",
    "New board members with public-company experience.",
    "Hiring for SOX compliance and investor relations.",
  ],
  forecastedAcquisition: [
    "Growth stalled: headcount flat for 4 quarters.",
    "Strategic partnership with a larger player announced in March.",
    "Founders left operational roles in the last 6 months.",
  ],
  forecastedGrowth: [
    "Sales team job postings up 3x in 60 days.",
    "New office opened in Berlin, 12 open roles there.",
    "Web traffic +45% quarter over quarter.",
  ],
};

export function makeSignal(agent: Agent, i: number, daysAgo = 0): Signal {
  const t = signalType(agent.type);
  const salt = [...agent.id].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const company = pick(COMPANIES, i * 5 + salt);
  const person = pick(PEOPLE, i + agent.id.length);
  const heat = 55 + ((i * 17 + agent.id.length * 7) % 44);
  const detected = new Date(Date.now() - daysAgo * 86400000 - i * 3600000 * 3).toISOString();
  const cfg = agent.config;
  const data: Signal["data"] = {};

  switch (agent.type) {
    case "adsEngagement": {
      const platforms = cfg.adPlatforms?.length ? AD_PLATFORMS.filter((p) => cfg.adPlatforms!.includes(p.value)) : AD_PLATFORMS;
      const p = pick(platforms, i);
      data.platform = p.label;
      data.campaign = pick(["Q1 — Signals launch", "Retargeting — Pricing visitors", "Brand — lemlist vs Outreach"], i);
      data.content = pick(["video_signals_15s", "carousel_ai_campaigns", "static_case_study"], i);
      data.keyword = p.value === "google" ? pick(["sales engagement tool", "cold email software"], i) : undefined;
      data.landingPage = `https://${cfg.website ?? "lemlist.com"}${pick(["/pricing", "/signals", "/features/ai"], i)}`;
      data.pagesViewed = 2 + (i % 5);
      data.duration = `${1 + (i % 4)} min ${10 + ((i * 13) % 50)} s`;
      data.clickId = p.clickId;
      break;
    }
    case "competitorCustomerCare": {
      const competitor = pick(cfg.companyUrls?.length ? cfg.companyUrls : ["linkedin.com/company/outreach-saas"], i).replace(/.*company\//, "");
      data.competitor = competitor.charAt(0).toUpperCase() + competitor.slice(1).replace(/-.*/, "");
      data.careMember = pick(["Anna Weber — Customer Success Manager", "Tom Leroy — Support Lead", "Inès Diallo — Account Manager"], i);
      data.heat = heat;
      break;
    }
    case "techDisplacement": {
      const pool = cfg.trackBy === "category" && cfg.categories?.length ? TECH_CATALOG.filter((x) => cfg.categories!.includes(x.category)) : TECH_CATALOG.filter((x) => !cfg.tools?.length || cfg.tools.includes(x.value));
      const tech = pick(pool.length ? pool : TECH_CATALOG, i);
      data.technology = tech.value;
      data.category = tech.category;
      data.changeDate = new Date(Date.now() - (daysAgo + 3) * 86400000).toLocaleDateString("en-GB");
      data.heat = heat;
      break;
    }
    case "aiAdoption": {
      const pool = AI_CATALOG.filter((x) => (!cfg.tools?.length || cfg.tools.includes(x.value)) && (!cfg.categories?.length || cfg.categories.includes(x.category)));
      const tech = pick(pool.length ? pool : AI_CATALOG, i);
      data.technology = tech.value;
      data.category = tech.category;
      data.changeDate = new Date(Date.now() - (daysAgo + 5) * 86400000).toLocaleDateString("en-GB");
      data.heat = heat;
      break;
    }
    case "employeeDeparture":
      data.departedEmployee = `${pick(PEOPLE, i + 3).firstName} ${pick(PEOPLE, i + 3).lastName}`;
      data.departedRole = pick(cfg.jobTitles?.length ? cfg.jobTitles : ["VP Sales"], i);
      data.heat = heat;
      break;
    case "dormantLinkedinPoster":
      data.silentDays = (cfg.reactivationGapDays ?? 75) + ((i * 11) % 60);
      data.comebackPost = pick([
        "After 4 months heads-down, here's what we learned rebuilding our outbound motion…",
        "Big news: I'm hiring 5 SDRs for our new EMEA team.",
        "We tested 3 sales engagement tools this quarter. Here's my honest take.",
      ], i);
      data.heat = heat;
      break;
    case "eventAttendees":
      data.event = pick(cfg.eventUrls?.length ? cfg.eventUrls : ["linkedin.com/events/saastr-europa-2027"], i).replace(/.*events\//, "").replace(/-/g, " ");
      data.attendance = pick(["Attending", "Attending", "Speaker"], i);
      data.heat = heat;
      break;
    case "companyRaisedFunds":
      data.fundingStage = pick(["Series B", "Series A", "Seed"], i);
      data.amount = pick(["$45,000,000", "$12,000,000", "$3,500,000"], i);
      data.investors = pick(["Accel, Index Ventures", "Partech", "Seedcamp"], i);
      break;
    default:
      if (t.forecast) {
        data.heat = heat;
        data.analysis = FORECAST_ANALYSIS[agent.type];
      }
  }

  return {
    id: `s${seq++}-${Date.now() % 100000}`,
    agentId: agent.id,
    type: agent.type,
    status: daysAgo > 3 ? "old" : "new",
    detectedAt: detected,
    company,
    contact: t.entity === "contact" || agent.type === "employeeDeparture" ? { ...person, email: `${person.email}${company.domain}` } : undefined,
    data,
  };
}

export function makeSignals(agent: Agent, count: number, maxDaysAgo = 10): Signal[] {
  return Array.from({ length: count }, (_, i) => makeSignal(agent, i, Math.floor((i / count) * maxDaysAgo)));
}

// "Signal details" rows of the side panel — order and labels from the Notion specs.
export function detailRows(s: Signal): { label: string; value: string | string[]; kind?: "heat" | "link" | "list" | "quote" }[] {
  const d = s.data;
  const rows: { label: string; value: string | string[]; kind?: "heat" | "link" | "list" | "quote" }[] = [];
  const add = (label: string, v: unknown, kind?: "heat" | "link" | "list" | "quote") => {
    if (v === undefined || v === null || v === "") return;
    rows.push({ label, value: Array.isArray(v) ? v : String(v), kind });
  };
  switch (s.type) {
    case "adsEngagement":
      add("Ad platform", d.platform); add("Campaign", d.campaign); add("Ad content", d.content); add("Keyword", d.keyword);
      add("Landing page", d.landingPage, "link"); add("Pages viewed", d.pagesViewed); add("Time on site", d.duration); add("Detected with", d.clickId ? `Click ID (${d.clickId}) + UTMs` : undefined);
      break;
    case "competitorCustomerCare":
      add("Competitor company", d.competitor); add("Care team member", d.careMember); add("Heat score", d.heat, "heat");
      break;
    case "techDisplacement":
      add("Technology dropped", d.technology); add("Technology category", d.category); add("Change date", d.changeDate); add("Heat score", d.heat, "heat");
      break;
    case "aiAdoption":
      add("AI tool adopted", d.technology); add("Technology category", d.category); add("Adoption date", d.changeDate); add("Heat score", d.heat, "heat");
      break;
    case "employeeDeparture":
      add("Departed employee", d.departedEmployee); add("Departed role", d.departedRole); add("Company monitored", s.company.name); add("Heat score", d.heat, "heat");
      break;
    case "dormantLinkedinPoster":
      add("Silent for", d.silentDays ? `${d.silentDays} days` : undefined); add("Comeback post", d.comebackPost, "quote"); add("Company", s.company.name); add("Heat score", d.heat, "heat");
      break;
    case "eventAttendees":
      add("Event", d.event); add("Participation", d.attendance); add("Heat score", d.heat, "heat");
      break;
    case "companyRaisedFunds":
      add("Last round type", d.fundingStage); add("Amount (USD)", d.amount); add("Investors", d.investors);
      break;
    default:
      add("Heat score", d.heat, "heat"); add("Why this company", d.analysis, "list");
  }
  return rows;
}

/** One-line label for the Signals table (prod: WatchListSignalLabelCell). */
export function signalLabel(s: Signal): string {
  const d = s.data;
  switch (s.type) {
    case "adsEngagement": return `Clicked a ${d.platform} ad`;
    case "competitorCustomerCare": return `Connected with ${d.competitor}'s care team`;
    case "techDisplacement": return `Dropped ${d.technology}`;
    case "aiAdoption": return `Adopted ${d.technology}`;
    case "employeeDeparture": return `${d.departedRole} left`;
    case "dormantLinkedinPoster": return `Posted after ${d.silentDays} days`;
    case "eventAttendees": return `${d.attendance} ${d.event}`;
    case "companyRaisedFunds": return `Raised ${d.amount} (${d.fundingStage})`;
    default: return signalType(s.type).forecast ? `${signalType(s.type).shortTitle} · heat ${d.heat}` : signalType(s.type).shortTitle;
  }
}

export const relTime = (iso: string) => {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
};

export const initials = (c: Company) => c.name.slice(0, 2).toUpperCase();
