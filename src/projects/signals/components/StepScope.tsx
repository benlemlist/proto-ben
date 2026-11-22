// Step "Scope" (prod WatchListSegmentToMonitorForm): segment radio cards filtered by the signal,
// then "Identification limit" (WatchListIdentificationLimitForm), then the segment's own form:
// all → "Filter criteria" (exclusion form) · list → CRM lists · csv → upload.
import { useState } from "react";
import { RadioCardGroup, RadioCard, Button, NumberInput, Checkbox, InfoMessage, Badge } from "@l3mpire/ui";
import { fa, signalType, CRM_LISTS, DAILY_LIMIT, INDUSTRIES, COMPANY_SIZES, COUNTRIES, JOB_TITLE_SUGGESTIONS, type SegmentType, type Agent } from "../data";
import { useSig } from "../store";
import { Section, Field, IncludeExclude, Muted } from "./ui";

const SEGMENTS: { id: SegmentType; title: string; description: string; icon: string }[] = [
  { id: "all", title: "All segments", description: "I want to retrieve all the entities that match this signal.", icon: fa("globe") },
  { id: "list", title: "Entity list", description: "Only monitor entities from an existing entity list within lemlist.", icon: fa("list") },
  { id: "csv", title: "Specific segment", description: "I only want to retrieve entities that belong to a specific segment using a CSV file.", icon: fa("file-csv") },
];

export const scopeValid = (a: Agent) => a.segmentType === "all" || (a.segmentType === "list" ? a.crmListIds.length > 0 : !!a.csvFile);

export function StepScope() {
  const s = useSig();
  const a = s.wizard!.draft;
  const t = signalType(a.type);
  const word = t.entity === "company" ? "company" : "contact";
  const words = t.entity === "company" ? "companies" : "contacts";
  const label = (x: string) => x.replace("Entity", word[0].toUpperCase() + word.slice(1)).replace("entities", words).replace("entity", word);

  return (
    <div className="flex flex-col gap-xl">
      <RadioCardGroup value={a.segmentType} onValueChange={(v) => s.setDraft((d) => ({ ...d, segmentType: v as SegmentType }))} orientation="vertical" className="grid grid-cols-1 gap-base">
        {SEGMENTS.filter((x) => t.segments.includes(x.id)).map((x) => (
          <RadioCard key={x.id} value={x.id} icon={x.icon} title={label(x.title)} description={label(x.description)} />
        ))}
      </RadioCardGroup>
      {t.forecast && a.segmentType !== "all" && (
        <InfoMessage type="info" description={`Up to 1,000 ${words} per agent: lemlist sends your list to the forecast model and only alerts on these ${words}.`} />
      )}

      {t.hasLimit && <LimitForm a={a} />}

      {a.segmentType === "all" && <FilterCriteria a={a} />}
      {a.segmentType === "list" && <CrmLists a={a} />}
      {a.segmentType === "csv" && <CsvImport a={a} />}
    </div>
  );
}

function LimitForm({ a }: { a: Agent }) {
  const s = useSig();
  const t = signalType(a.type);
  const credits = t.credits ?? 0;
  const v = a.dailyLimit;
  const set = (n: number) => s.setDraft((d) => ({ ...d, dailyLimit: n }));
  return (
    <Section icon={fa("coin")} title="Identification limit">
      <div className="flex flex-col gap-2xs">
        <span className="text-base leading-base font-semibold">Maximum number of signals identified per day</span>
        <Muted>Select the max number of signals you want to identify daily.</Muted>
      </div>
      <div className="flex items-center justify-between">
        <Muted>{credits} credits per signal identified.</Muted>
        <span className="text-base leading-base"><Muted>Today: </Muted><span className="font-semibold">0 / {v} identified</span></span>
      </div>
      <input type="range" min={DAILY_LIMIT.min} max={DAILY_LIMIT.max} value={Math.min(v, DAILY_LIMIT.max)} onChange={(e) => set(Number(e.target.value))}
        className="w-full accent-[var(--comp-btn-solid-brand-bg-default)]" aria-label="Daily limit" />
      <div className="flex items-end justify-between gap-lg">
        <div className="flex items-center gap-sm">
          {DAILY_LIMIT.ranges.map((r) => (
            <Button key={r} appearance={r === v ? "solid" : "outlined"} intent="brand" size="sm" onClick={() => set(r)}>{r}</Button>
          ))}
          <NumberInput size="sm" value={v} min={DAILY_LIMIT.min} max={DAILY_LIMIT.customMax} onChange={set} />
        </div>
        <span className="text-right text-sm leading-sm text-[var(--core-text-main-tertiary)]">
          It will cost approximately:<br />{(v * credits).toLocaleString("en")} credits daily, {(v * credits * 30).toLocaleString("en")} credits per month
        </span>
      </div>
      {a.type === "dormantLinkedinPoster" && (
        <Badge type="warning" size="sm" className="self-start">Spec has a 2nd limit (dailyExtractLimit = 100): merged into this one, to validate</Badge>
      )}
    </Section>
  );
}

function FilterCriteria({ a }: { a: Agent }) {
  const s = useSig();
  const t = signalType(a.type);
  const f = a.filters;
  const set = (k: keyof Agent["filters"], v: { in: string[]; out: string[] }) => s.setDraft((d) => ({ ...d, filters: { ...d.filters, [k]: v } }));
  const count = f.industries.in.length + f.sizes.in.length + f.locations.in.length + f.jobTitles.in.length;
  return (
    <Section icon={fa("filter")} title="Filter criteria">
      {t.entity === "contact" && (
        <IncludeExclude label="Contact job titles" description="Include or exclude contacts with these titles." options={JOB_TITLE_SUGGESTIONS} value={f.jobTitles} onChange={(v) => set("jobTitles", v)} />
      )}
      <IncludeExclude label="Company industries" description="Include or exclude companies in these industries." options={INDUSTRIES} value={f.industries} onChange={(v) => set("industries", v)} />
      <IncludeExclude label="Company sizes" description="Include or exclude companies of these sizes." options={COMPANY_SIZES} value={f.sizes} onChange={(v) => set("sizes", v)} />
      <IncludeExclude label="Company location" description="Include or exclude companies in these locations." options={COUNTRIES} value={f.locations} onChange={(v) => set("locations", v)} />
      {count > 12 && <InfoMessage type="warning" description="Too many filters can slow down detection and reduce results." />}
    </Section>
  );
}

function CrmLists({ a }: { a: Agent }) {
  const s = useSig();
  const t = signalType(a.type);
  const words = t.entity === "company" ? "companies" : "contacts";
  const toggle = (id: string, on: boolean) => s.setDraft((d) => ({ ...d, crmListIds: on ? [...d.crmListIds, id] : d.crmListIds.filter((x) => x !== id) }));
  const total = CRM_LISTS.filter((l) => a.crmListIds.includes(l.id)).reduce((n, l) => n + l.count, 0);
  return (
    <Section icon={fa("list")} title={`${t.entity === "company" ? "Company" : "Contact"} lists`}>
      <Field label="Lists to monitor" description={`The agent only watches the ${words} of these lists. New ${words} added to a list are picked up automatically.`}>
        <div className="flex flex-col gap-xs">
          {CRM_LISTS.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-base border border-[var(--core-border-main-subtle)] px-lg py-base">
              <Checkbox label={l.name} checked={a.crmListIds.includes(l.id)} onCheckedChange={(v) => toggle(l.id, v === true)} />
              <Muted>{l.count} {words}</Muted>
            </div>
          ))}
        </div>
      </Field>
      {total > 0 && <InfoMessage type="success" description={`${total.toLocaleString("en")} ${words} will be monitored by this agent.`} />}
    </Section>
  );
}

function CsvImport({ a }: { a: Agent }) {
  const s = useSig();
  const t = signalType(a.type);
  const [busy, setBusy] = useState(false);
  const words = t.entity === "company" ? "companies" : "contacts";
  return (
    <Section icon={fa("file-csv")} title={`Import ${words} from CSV`}>
      <Muted>Upload a .CSV file of the {words} you want to monitor with the agent. Required columns: domain and name.</Muted>
      {a.csvFile ? (
        <div className="flex items-center justify-between rounded-base border border-[var(--core-border-main-subtle)] px-lg py-base">
          <span className="text-base leading-base">📄 {a.csvFile} · <Muted>248 {words} found</Muted></span>
          <Button appearance="ghost" intent="alert" size="sm" onClick={() => s.setDraft((d) => ({ ...d, csvFile: undefined }))}>Remove file</Button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => { setBusy(true); setTimeout(() => { s.setDraft((d) => ({ ...d, csvFile: "target-accounts-q1.csv" })); setBusy(false); }, 700); }}
          className="flex flex-col items-center gap-xs rounded-lg border border-dashed border-[var(--core-border-main-subtle)] px-xl py-3xl hover:bg-[var(--core-bg-main-hover)]">
          <span className="text-base leading-base font-medium">{busy ? "Reading file…" : "Drop your CSV here or click to upload"}</span>
          <Muted>Proto: simulates target-accounts-q1.csv</Muted>
        </button>
      )}
    </Section>
  );
}
