// Step "Configure your signal": "Agent configuration" (emoji + name) then the signal's own section(s).
// One form per new signal, each built on the prod form of its closest existing signal:
//   Tech displacement / AI adoption → Technology change · Competitor care / Event attendees → Competitor connections
//   Employee departure / LinkedIn comeback → New hire · Ads engagement → Website visitors · Forecasted × 4 → no form (M&A-like, without inputs)
import { TextInput, Select, DropdownMenu, DropdownMenuList, DropdownMenuItem, MultiSelect, NumberInput, InfoMessage, RadioCardGroup, RadioCard, Switch, TextArea, ChipInput, Button, EmojiPickerPopover, Badge } from "@l3mpire/ui";
import { useState } from "react";
import { fa, faBrand, AD_PLATFORMS, CARE_ROLES, TECH_CATALOG, TECH_CATEGORIES, AI_CATALOG, AI_CATEGORIES, JOB_TITLE_SUGGESTIONS, TRACKED_WEBSITES, signalType, type Agent, type AgentConfig } from "../data";
import { useSig } from "../store";
import { Section, Field, Pills, UrlList, Muted } from "./ui";

const LINKEDIN_COMPANY = /^linkedin\.com\/company\/[^/]+/;
const LINKEDIN_PROFILE = /^linkedin\.com\/in\/[^/]+/;
const LINKEDIN_EVENT = /^linkedin\.com\/events\/[^/]+/;
export const COMPETITOR_CARE_MAX = 500;

/** Mirrors `configurationFormValidity` of each prod form. */
export function configValid(a: Agent): boolean {
  const c = a.config;
  switch (a.type) {
    case "adsEngagement": return !!c.website;
    case "competitorCustomerCare": return ((c.companyUrls?.length ?? 0) + (c.profileUrls?.length ?? 0)) > 0 && (c.trackedRoles?.length ?? 0) > 0;
    case "techDisplacement": return c.trackBy === "category" ? (c.categories?.length ?? 0) > 0 : (c.tools?.length ?? 0) > 0;
    case "employeeDeparture":
    case "dormantLinkedinPoster": return (c.jobTitles?.length ?? 0) > 0;
    case "eventAttendees": return (c.eventUrls?.length ?? 0) > 0;
    default: return true;
  }
}

export function StepConfigure() {
  const s = useSig();
  const a = s.wizard!.draft;
  const t = signalType(a.type);
  const set = (patch: Partial<AgentConfig>) => s.setDraft((d) => ({ ...d, config: { ...d.config, ...patch } }));

  return (
    <div className="flex flex-col gap-xl">
      <Section icon={fa("circle-info")} title="Agent configuration">
        <div className="flex items-end gap-base">
          <EmojiPickerPopover onSelect={(e) => s.setDraft((d) => ({ ...d, emoji: e.native }))}>
            <Button appearance="outlined" intent="brand" size="md" aria-label="Change emoji"><span>{a.emoji}</span></Button>
          </EmojiPickerPopover>
          <div className="flex-1">
            <TextInput size="md" label="Agent name *" placeholder="Name your agent" value={a.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => s.setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
        </div>
        {(a.type === "adsEngagement") && <TrackerLinks />}
      </Section>

      {t.forecast && <ForecastExplainer type={a.type} />}
      {a.type === "techDisplacement" && <TechDisplacementForm a={a} set={set} />}
      {a.type === "aiAdoption" && <AiAdoptionForm a={a} set={set} />}
      {a.type === "competitorCustomerCare" && <CompetitorCareForm a={a} set={set} />}
      {a.type === "eventAttendees" && <EventAttendeesForm a={a} set={set} />}
      {a.type === "employeeDeparture" && <EmployeeDepartureForm a={a} set={set} />}
      {a.type === "dormantLinkedinPoster" && <ComebackForm a={a} set={set} />}
      {a.type === "adsEngagement" && <AdsEngagementForm a={a} set={set} />}
      {!t.isNew && <ProdPlaceholder />}
    </div>
  );
}

type FormProps = { a: Agent; set: (p: Partial<AgentConfig>) => void };

function ProdPlaceholder() {
  return <InfoMessage type="empty" title="Existing signal" description="This form already exists in prod and is not redesigned in this proto. Pick one of the signals tagged New to review the new forms." />;
}

// ── Forecasted funding / IPO / acquisition / growth ─────────────────────────
const FORECAST_COPY: Record<string, { what: string; inputs: string[] }> = {
  forecastedFunding: { what: "companies likely to raise a new round in the coming months", inputs: ["Hiring velocity by team", "Time since the last round", "Leadership hires (CFO, investor relations)", "Web traffic and news momentum"] },
  forecastedIpo: { what: "companies preparing to go public", inputs: ["Revenue and profitability signals", "Board and leadership changes", "Compliance and investor relations hiring", "Press coverage"] },
  forecastedAcquisition: { what: "companies likely to be acquired", inputs: ["Headcount and growth slowdown", "Strategic partnerships", "Founder and leadership departures", "Funding runway"] },
  forecastedGrowth: { what: "companies about to scale their teams", inputs: ["Job postings by department", "New offices and markets", "Web traffic growth", "Recent funding"] },
};

function ForecastExplainer({ type }: { type: string }) {
  const c = FORECAST_COPY[type];
  return (
    <Section icon={fa("crystal-ball")} title="How this signal works">
      <InfoMessage type="ai" title="Nothing to configure here" description={`lemlist predicts ${c.what}. You choose which companies to monitor in the next step: all companies, a company list or a CSV.`} />
      <Field label="What the prediction is based on" description="Each signal comes with a heat score (0–100) and an AI analysis that explains why the company stands out.">
        <ul className="flex flex-col gap-xs pl-xl text-base leading-base text-[var(--core-text-main-secondary)] [list-style:disc]">
          {c.inputs.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </Field>
    </Section>
  );
}

// ── Tech displacement (Technology change form + "track by") ─────────────────
function TechDisplacementForm({ a, set }: FormProps) {
  const by = a.config.trackBy ?? "tool";
  return (
    <Section icon={fa("arrow-right-arrow-left")} title="Technologies to monitor">
      <Field label="Track by" required description="Get a signal when a company drops a specific tool, or any tool of a category.">
        <RadioCardGroup value={by} onValueChange={(v) => set({ trackBy: v as "tool" | "category" })}>
          <RadioCard value="tool" icon={fa("cube")} title="Specific tools" description="e.g. Outreach, Salesloft" />
          <RadioCard value="category" icon={fa("shapes")} title="A tool category" description="e.g. any CRM, any support tool" />
        </RadioCardGroup>
      </Field>
      {by === "tool" ? (
        <MultiSelect size="md" label="Technologies *" placeholder="Add a technology" searchable
          options={TECH_CATALOG.map((x) => ({ value: x.value, label: x.value, sublabel: x.category }))}
          value={a.config.tools ?? []} onValueChange={(v) => set({ tools: v })} />
      ) : (
        <MultiSelect size="md" label="Categories *" placeholder="Add a category" options={TECH_CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={a.config.categories ?? []} onValueChange={(v) => set({ categories: v })} />
      )}
      <Muted>Tip: track your competitors' tools — a company that drops them is looking for a replacement.</Muted>
    </Section>
  );
}

// ── AI adoption (Technology change form, AI catalog, optional) ──────────────
function AiAdoptionForm({ a, set }: FormProps) {
  const cats = a.config.categories ?? [];
  return (
    <Section icon={fa("microchip-ai")} title="AI tools to monitor">
      <InfoMessage type="info" description="Optional. Leave both fields empty to get a signal for any AI tool a company adopts." />
      <MultiSelect size="md" label="AI categories" placeholder="Any category" options={AI_CATEGORIES.map((c) => ({ value: c, label: c }))}
        value={cats} onValueChange={(v) => set({ categories: v })} />
      <MultiSelect size="md" label="AI tools" placeholder="Any tool" searchable
        options={AI_CATALOG.filter((x) => !cats.length || cats.includes(x.category)).map((x) => ({ value: x.value, label: x.value, sublabel: x.category }))}
        value={a.config.tools ?? []} onValueChange={(v) => set({ tools: v })} />
    </Section>
  );
}

// ── Competitor customer care (Competitor connections form) ──────────────────
function CompetitorCareForm({ a, set }: FormProps) {
  const c = a.config;
  const total = (c.companyUrls?.length ?? 0) + (c.profileUrls?.length ?? 0);
  return (
    <Section icon={fa("headset")} title="Competitor to monitor">
      <Field label="LinkedIn company URLs" description="We find the customer success and support people of these companies and watch who connects with them.">
        <UrlList label="LinkedIn company URLs (one per line)" placeholder={"https://linkedin.com/company/apolloio\nhttps://linkedin.com/company/outreach-saas"}
          values={c.companyUrls ?? []} onChange={(v) => set({ companyUrls: v })} max={COMPETITOR_CARE_MAX - (c.profileUrls?.length ?? 0)} addLabel="Add company URLs"
          validate={(v, all) => (!LINKEDIN_COMPANY.test(v) ? "Not a company LinkedIn URL" : all.includes(v) ? "Company URL already added" : null)}
          counter={() => `${total}/${COMPETITOR_CARE_MAX} URLs added`} />
      </Field>
      <Field label="LinkedIn profile URLs" description="Optional. Add specific care team members you already know.">
        <UrlList label="LinkedIn profile URLs (one per line)" placeholder={"https://linkedin.com/in/anna-weber"}
          values={c.profileUrls ?? []} onChange={(v) => set({ profileUrls: v })} max={COMPETITOR_CARE_MAX - (c.companyUrls?.length ?? 0)} addLabel="Add profile URLs"
          validate={(v, all) => (!LINKEDIN_PROFILE.test(v) ? "Not a LinkedIn profile URL" : all.includes(v) ? "Profile already added" : null)}
          counter={() => "At least one company or profile URL is required"} />
      </Field>
      <Field label="Teams to track" required description="Which teams of your competitors count as customer care.">
        <Pills options={CARE_ROLES} values={c.trackedRoles ?? []} onChange={(v) => set({ trackedRoles: v })} />
      </Field>
    </Section>
  );
}

// ── Event attendees (Competitor connections form, event URLs) ───────────────
function EventAttendeesForm({ a, set }: FormProps) {
  const c = a.config;
  const [adv, setAdv] = useState(false);
  return (
    <Section icon={fa("calendar-star")} title="Events to monitor">
      <Field label="LinkedIn event URLs" required description="Add the events your buyers attend. We deliver the people who registered.">
        <UrlList label="LinkedIn event URLs (one per line)" placeholder={"https://linkedin.com/events/saastr-europa-2027\nhttps://linkedin.com/events/b2b-rocks-paris"}
          values={c.eventUrls ?? []} onChange={(v) => set({ eventUrls: v })} max={50} addLabel="Add events"
          validate={(v, all) => (!LINKEDIN_EVENT.test(v) ? "Not a LinkedIn event URL" : all.includes(v) ? "Event already added" : null)}
          counter={(n) => `${n}/50 events added`} />
      </Field>
      <div className="flex flex-col gap-base">
        <Button appearance="ghost" intent="brand" size="sm" className="self-start" rightIcon={adv ? fa("chevron-up") : fa("chevron-down")} onClick={() => setAdv(!adv)}>Advanced settings</Button>
        {adv && (
          <div className="flex flex-col gap-lg rounded-base border border-[var(--core-border-main-subtle)] p-lg">
            <Switch label="Also deliver people engaging with the event's posts" checked={!!c.includeEngagers} onCheckedChange={(v) => set({ includeEngagers: v })} />
            {c.includeEngagers && (
              <Pills options={[{ value: "likes", label: "Likes" }, { value: "comments", label: "Comments" }, { value: "poster", label: "Post author" }]}
                values={c.engagementTypes ?? []} onChange={(v) => set({ engagementTypes: v })} />
            )}
            <Badge type="warning" size="sm" className="self-start">To validate with Etienne: post-engagement fields come from the spec</Badge>
          </div>
        )}
      </div>
    </Section>
  );
}

// ── Employee departure (New hire form, reversed) ────────────────────────────
function EmployeeDepartureForm({ a, set }: FormProps) {
  return (
    <Section icon={fa("user-minus")} title="Roles to monitor">
      <JobTitles a={a} set={set} description="Get a signal when someone with one of these titles leaves a company." />
      <InfoMessage type="info" title="Who gets delivered" description="The company that lost the role. To also reach the people who now own the topic, pick a persona in Signal processing (Auto-push to campaign)." />
    </Section>
  );
}

// ── LinkedIn comeback (New hire form + gap) ─────────────────────────────────
function ComebackForm({ a, set }: FormProps) {
  return (
    <Section icon={faBrand("linkedin")} title="People to monitor">
      <JobTitles a={a} set={set} description="Only people with these titles are delivered when they post again." />
      <Field label="Silence before the comeback" description="How long someone must have stayed silent on LinkedIn before their new post counts.">
        <div className="flex items-center gap-base">
          <NumberInput size="md" value={a.config.reactivationGapDays ?? 75} min={30} max={365} step={15} onChange={(v) => set({ reactivationGapDays: v })} />
          <Muted>days (default 75)</Muted>
        </div>
      </Field>
    </Section>
  );
}

function JobTitles({ a, set, description }: FormProps & { description: string }) {
  const titles = a.config.jobTitles ?? [];
  return (
    <Field label="Job titles" required description={description}>
      <ChipInput size="md" values={titles} onChange={(v) => set({ jobTitles: v })} placeholder="e.g., VP Sales, Chief Technology Officer" />
      <div className="flex flex-wrap items-center gap-xs">
        <Muted>Suggestions:</Muted>
        {JOB_TITLE_SUGGESTIONS.filter((x) => !titles.includes(x)).slice(0, 5).map((x) => (
          <Button key={x} appearance="ghost" intent="brand" size="xs" leftIcon={fa("plus")} onClick={() => set({ jobTitles: [...titles, x] })}>{x}</Button>
        ))}
      </div>
    </Field>
  );
}

// ── Ads engagement (Website visitors form) ──────────────────────────────────
function TrackerLinks() {
  const s = useSig();
  if (s.trackingInstalled) return null;
  return (
    <InfoMessage type="warning" title="No tracking script on your websites"
      description="Ads engagement reads the visits of your Website visitors script. Install it first, then come back to this agent."
      action={<Button appearance="outlined" intent="brand" size="md" onClick={() => { s.setTracking(true); s.toast({ type: "success", title: "Tracking script detected", subtitle: "Proto: lemlist.com now sends visits." }); }}>Install the script</Button>} />
  );
}

const DURATIONS = [{ v: "0", l: "Any duration" }, { v: "10", l: "10 seconds" }, { v: "30", l: "30 seconds" }, { v: "60", l: "1 minute" }, { v: "180", l: "3 minutes" }];
const PAGES = ["1", "2", "3", "5"];

function AdsEngagementForm({ a, set }: FormProps) {
  const s = useSig();
  const c = a.config;
  const [siteOpen, setSiteOpen] = useState(false);
  const [durOpen, setDurOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const sites = s.trackingInstalled ? TRACKED_WEBSITES : [];
  return (
    <>
      <Section icon={fa("rectangle-ad")} title="Ads engagement setup">
        <Field label="Website" required description="The website your ads send traffic to. Only websites with the tracking script are listed.">
          <Select size="md" placeholder={sites.length ? "Select a website" : "No website with the tracking script"} value={c.website} isOpen={siteOpen} onOpenChange={setSiteOpen} disabled={!sites.length}>
            <DropdownMenu className="w-[320px]">
              <DropdownMenuList>
                {sites.map((w) => <DropdownMenuItem key={w} label={w} description="Tracking script active" selected={c.website === w} onClick={() => { set({ website: w }); setSiteOpen(false); }} />)}
              </DropdownMenuList>
            </DropdownMenu>
          </Select>
        </Field>
        <Field label="Ad platforms" description="Leave empty to catch clicks from every platform.">
          <Pills options={AD_PLATFORMS} values={c.adPlatforms ?? []} onChange={(v) => set({ adPlatforms: v })} />
        </Field>
      </Section>

      <Section icon={fa("filter")} title="Inclusion criteria">
        <Field label="Pages tracked" description="Only count visits that land on these pages (one per line). Leave empty for the whole website.">
          <TextArea placeholder={"/pricing\n/demo"} value={c.pagesTracked ?? ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set({ pagesTracked: e.target.value })} rows={3} />
        </Field>
        <div className="grid grid-cols-2 gap-lg">
          <Select size="md" label="Minimum visit duration" value={DURATIONS.find((d) => d.v === c.minDuration)?.l} isOpen={durOpen} onOpenChange={setDurOpen}>
            <DropdownMenu className="w-[240px]"><DropdownMenuList>
              {DURATIONS.map((d) => <DropdownMenuItem key={d.v} label={d.l} selected={c.minDuration === d.v} onClick={() => { set({ minDuration: d.v }); setDurOpen(false); }} />)}
            </DropdownMenuList></DropdownMenu>
          </Select>
          <Select size="md" label="Minimum pages viewed" value={c.minPages ? `${c.minPages} page${c.minPages === "1" ? "" : "s"}` : undefined} isOpen={pagesOpen} onOpenChange={setPagesOpen}>
            <DropdownMenu className="w-[240px]"><DropdownMenuList>
              {PAGES.map((p) => <DropdownMenuItem key={p} label={`${p} page${p === "1" ? "" : "s"}`} selected={c.minPages === p} onClick={() => { set({ minPages: p }); setPagesOpen(false); }} />)}
            </DropdownMenuList></DropdownMenu>
          </Select>
        </div>
      </Section>

      <Section icon={fa("book-open")} title="UTM setup guide" defaultOpen={false} right={<Badge type="neutral" size="sm">Optional</Badge>}>
        <InfoMessage type="success" title="Works without UTMs" description="We detect ad clicks with the click ID each platform adds to the URL (gclid, fbclid, li_fat_id, ttclid, twclid). UTMs add the campaign, ad and keyword to each signal." />
        <div className="flex flex-col gap-base">
          {AD_PLATFORMS.map((p) => (
            <div key={p.value} className="flex items-center gap-lg rounded-base border border-[var(--core-border-main-subtle)] px-lg py-base">
              <span className="w-[120px] shrink-0 text-base leading-base font-medium">{p.label}</span>
              <code className="min-w-0 flex-1 truncate text-sm leading-sm text-[var(--core-text-main-secondary)]">
                ?utm_source={p.value}&utm_medium=paid&utm_campaign={"{campaign}"}&utm_content={"{ad}"}{p.value === "google" ? "&utm_term={keyword}" : ""}
              </code>
              <Button appearance="ghost" intent="brand" size="xs" leftIcon={fa("copy")} onClick={() => s.toast({ type: "info", title: "Template copied" })}>Copy</Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
