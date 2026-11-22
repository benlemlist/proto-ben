// Step "Summary" (prod WatchListSummary): Signal to detect · signal summary · Scope · Signal processing · Billing.
import { Badge } from "@l3mpire/ui";
import { fa, signalType, AD_PLATFORMS, CARE_ROLES, CRM_LISTS, PERSONAS, PROCESSING, TEAM, type Agent } from "../data";
import { useSig } from "../store";
import { Section, SummaryRow, Muted } from "./ui";

const chips = (xs: string[] | undefined, empty = "Any") => (xs?.length ? xs.map((x) => <Badge key={x} type="neutral" size="sm">{x}</Badge>) : <Muted>{empty}</Muted>);

export function configSummary(a: Agent): { label: string; node: React.ReactNode }[] {
  const c = a.config;
  switch (a.type) {
    case "adsEngagement": return [
      { label: "Website", node: c.website },
      { label: "Ad platforms", node: chips(AD_PLATFORMS.filter((p) => c.adPlatforms?.includes(p.value)).map((p) => p.label), "All platforms") },
      { label: "Pages tracked", node: chips(c.pagesTracked?.split("\n").filter(Boolean), "Whole website") },
      { label: "Min. duration / pages", node: `${c.minDuration === "0" ? "Any" : `${c.minDuration}s`} · ${c.minPages} page(s)` },
    ];
    case "competitorCustomerCare": return [
      { label: "Competitors", node: chips([...(c.companyUrls ?? []), ...(c.profileUrls ?? [])].map((u) => u.replace(/linkedin\.com\/(company|in)\//, ""))) },
      { label: "Teams tracked", node: chips(CARE_ROLES.filter((r) => c.trackedRoles?.includes(r.value)).map((r) => r.label)) },
    ];
    case "techDisplacement": return [
      { label: c.trackBy === "category" ? "Categories" : "Technologies", node: chips(c.trackBy === "category" ? c.categories : c.tools) },
    ];
    case "aiAdoption": return [
      { label: "AI categories", node: chips(c.categories) },
      { label: "AI tools", node: chips(c.tools) },
    ];
    case "employeeDeparture": return [{ label: "Job titles", node: chips(c.jobTitles) }, { label: "Delivered", node: "The company that lost the role" }];
    case "dormantLinkedinPoster": return [{ label: "Job titles", node: chips(c.jobTitles) }, { label: "Silence before comeback", node: `${c.reactivationGapDays} days` }];
    case "eventAttendees": return [
      { label: "Events", node: chips(c.eventUrls?.map((u) => u.replace("linkedin.com/events/", ""))) },
      { label: "Post engagers", node: c.includeEngagers ? chips(c.engagementTypes) : "Not included" },
    ];
    default: return signalType(a.type).forecast ? [{ label: "Configuration", node: "None needed — heat score and AI analysis on every signal" }] : [];
  }
}

export function StepSummary() {
  const s = useSig();
  const a = s.wizard!.draft;
  const t = signalType(a.type);
  const f = a.filters;
  const proc = PROCESSING.find((p) => p.id === a.processing)!;
  const lists = CRM_LISTS.filter((l) => a.crmListIds.includes(l.id));
  const words = t.entity === "company" ? "companies" : "contacts";
  return (
    <div className="flex flex-col gap-xl">
      <Section icon={fa("crosshairs")} title="Signal to detect">
        <SummaryRow label="Agent">{a.emoji} {a.name}</SummaryRow>
        <SummaryRow label="Signal"><Badge type="neutral" size="sm" icon={t.icon}>{t.title}</Badge>{t.isNew && <Badge type="info" size="sm">New</Badge>}</SummaryRow>
        {configSummary(a).map((r) => <SummaryRow key={r.label} label={r.label}>{r.node}</SummaryRow>)}
      </Section>
      <Section icon={fa("globe")} title="Scope">
        <SummaryRow label="Source">
          {a.segmentType === "all" ? `All ${words}` : a.segmentType === "list" ? chips(lists.map((l) => l.name)) : a.csvFile}
        </SummaryRow>
        {a.segmentType === "all" && (
          <>
            <SummaryRow label="Industries">{chips(f.industries.in)}{f.industries.out.map((x) => <Badge key={x} type="critical" size="sm">not {x}</Badge>)}</SummaryRow>
            <SummaryRow label="Company sizes">{chips(f.sizes.in)}</SummaryRow>
            <SummaryRow label="Locations">{chips(f.locations.in)}</SummaryRow>
          </>
        )}
        {t.hasLimit && <SummaryRow label="Identification limit">{a.dailyLimit} per day</SummaryRow>}
      </Section>
      <Section icon={fa("paper-plane-top")} title="Signal processing">
        <SummaryRow label="Processing">{proc.label}</SummaryRow>
        {a.processing === "campaign" && t.personaSourcing && <SummaryRow label="Sourcing persona">{PERSONAS.find((p) => p.id === a.personaId)?.name ?? <Muted>None</Muted>}</SummaryRow>}
        {a.processing === "campaign" && <SummaryRow label="Campaign">{a.campaign}</SummaryRow>}
        {a.processing === "task" && <SummaryRow label="Owner">{TEAM.find((u) => u.id === a.ownerId)?.name}</SummaryRow>}
      </Section>
      <Section icon={fa("coin")} title="Billing">
        <SummaryRow label="Cost per result">{t.credits === null ? "Billed like Website visitors (per identified company)" : `${t.credits} credits`}</SummaryRow>
        {t.hasLimit && t.credits !== null && <SummaryRow label="Maximum per month">{(a.dailyLimit * t.credits * 30).toLocaleString("en")} credits</SummaryRow>}
      </Section>
    </div>
  );
}
