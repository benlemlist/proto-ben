// Field Mapping tab, simplified: one block per Salesforce object an activity lands on.
// Rows = the Salesforce fields lemlist writes (not the ~50 lemlist fields). Each row picks its
// value: a lemlist field, a fixed value or a value per activity. Replaces Advanced › Default values.
import { useState } from "react";
import {
  Badge, BadgeSpecific, Button, Link, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuList, DropdownMenuRadixItem,
  DropdownMenuHeading, DropdownMenuSearch, Select, DropdownMenu, DropdownMenuItem, cn,
} from "@l3mpire/ui";
import {
  Icon, faArrowLeftOutline, faPlusOutline, faTrashOutline, faLockOutline, faUsersOutline, faBuildingsOutline,
  faChevronDownOutline, faChevronRightOutline, faCircleInfoOutline, type IconDefinition,
} from "@l3mpire/icons";
import {
  FALLBACK, OBJECT_LABEL, OBJECT_SINGULAR, SF_FIELDS, lemlistField, sfField, objectOf,
  type Activity, type Mapping, type ObjectId, type Row, type SfField, type Source,
} from "../data";
import { FixedInput, ValuePicker } from "./ValuePicker";

const OBJECT_ORDER: ObjectId[] = ["task", "emailMessage", "event"];
const COLS = "grid grid-cols-[minmax(140px,1fr)_16px_minmax(220px,1.4fr)_minmax(140px,1fr)_28px] items-start gap-x-lg";

/** What lemlist would write in this field for one activity. */
function preview(row: Row, activityId: string): { text: string; fallback?: boolean } | null {
  const s = row.source;
  if (s.kind === "fixed") return s.value ? { text: s.value } : null;
  if (s.kind === "perActivity") return s.values[activityId] ? { text: s.values[activityId] } : null;
  if (s.kind !== "field") return null;
  const carries = (id: string) => { const f = lemlistField(id); return f && (f.carriedBy === "all" || f.carriedBy.includes(activityId)); };
  if (carries(s.field)) return { text: lemlistField(s.field)!.example };
  const fb = FALLBACK[s.field];
  if (fb && carries(fb)) return { text: lemlistField(fb)!.example, fallback: true };
  return null;
}

export function FieldMappingTab({ mapping, setMapping, activities, newObjects, onOpenActivities }: {
  mapping: Mapping; setMapping: (fn: (m: Mapping) => Mapping) => void; activities: Activity[];
  newObjects: Set<ObjectId>; onOpenActivities: () => void;
}) {
  const used = (o: ObjectId) => activities.filter((a) => a.on && objectOf(a.destination) === o);
  const objects = OBJECT_ORDER.filter((o) => used(o).length > 0);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-xl">
        <RecordGroup icon={faUsersOutline} label="Contacts" fields={5} target="Contacts" />
        <RecordGroup icon={faBuildingsOutline} label="Companies" fields={3} target="Accounts" />
        <RecordGroup icon={faUsersOutline} label="Contacts" fields={3} target="Leads" />
        {objects.map((o) => (
          <ObjectBlock
            key={o}
            object={o}
            rows={mapping[o]}
            activities={used(o)}
            isNew={newObjects.has(o)}
            onOpenActivities={onOpenActivities}
            setRows={(fn) => setMapping((m) => ({ ...m, [o]: fn(m[o]) }))}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

/** Contacts / Companies / Leads: prod's field mapping, untouched by this project. */
function RecordGroup({ icon, label, fields, target }: { icon: IconDefinition; label: string; fields: number; target: string }) {
  return (
    <div className="flex items-center gap-base rounded-lg border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] px-xl py-lg text-base leading-base">
      <Icon icon={icon} size="sm" className="text-[var(--core-text-main-tertiary)]" />
      <span className="font-medium text-[var(--core-text-main-primary)]">{label}</span>
      <span className="text-[var(--core-text-main-tertiary)]">{fields} fields · Salesforce {target}</span>
      <span className="ml-auto text-sm leading-sm text-[var(--core-text-main-tertiary)]">Unchanged, as in prod</span>
    </div>
  );
}

function ObjectBlock({ object, rows, activities, isNew, setRows, onOpenActivities }: {
  object: ObjectId; rows: Row[]; activities: Activity[]; isNew: boolean;
  setRows: (fn: (r: Row[]) => Row[]) => void; onOpenActivities: () => void;
}) {
  const [previewId, setPreviewId] = useState(activities[0]?.id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewActivity = activities.find((a) => a.id === previewId) ?? activities[0];
  const mapped = new Set(rows.map((r) => r.api));
  const update = (api: string, source: Source) => setRows((rs) => rs.map((r) => (r.api === api ? { ...r, source } : r)));
  const remove = (api: string) => setRows((rs) => rs.filter((r) => r.api !== api));
  const add = (api: string) => setRows((rs) => [...rs, { api, source: { kind: "empty" } }]);

  return (
    <section className="flex flex-col rounded-lg border border-[var(--core-border-main-subtle)]">
      <header className="flex flex-wrap items-center gap-base border-b border-[var(--core-border-main-subtle)] px-xl py-lg">
        <span className="text-md leading-md font-semibold text-[var(--core-text-main-primary)]">{OBJECT_LABEL[object]}</span>
        <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Salesforce {OBJECT_SINGULAR[object]}</span>
        {isNew && <BadgeSpecific type="new">New</BadgeSpecific>}
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="cursor-default"><Badge type="neutral" size="sm">Used by {activities.length} activities</Badge></button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[280px]">{activities.map((a) => a.label).join(", ")}</TooltipContent>
        </Tooltip>
        <Link intent="neutral" size="sm" underlined onClick={onOpenActivities}>Change in Activities</Link>
        <div className="ml-auto flex items-center gap-sm">
          <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Preview with</span>
          <div className="w-[200px]">
            <Select size="sm" value={previewActivity?.label} isOpen={previewOpen} onOpenChange={setPreviewOpen}>
              <DropdownMenu className="w-[220px]">
                <DropdownMenuList>
                  {activities.map((a) => <DropdownMenuItem key={a.id} label={a.label} selected={a.id === previewActivity?.id} onClick={() => { setPreviewId(a.id); setPreviewOpen(false); }} />)}
                </DropdownMenuList>
              </DropdownMenu>
            </Select>
          </div>
        </div>
      </header>

      <div className={cn(COLS, "px-xl pt-lg pb-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]")}>
        <span>Salesforce field</span><span />
        <span>Value lemlist writes</span>
        <span>Preview · {previewActivity?.label}</span><span />
      </div>

      <div className="flex flex-col">
        {rows.map((row) => (
          <FieldRow
            key={row.api}
            sf={sfField(object, row.api)}
            row={row}
            activities={activities}
            previewId={previewActivity?.id ?? ""}
            onChange={(s) => update(row.api, s)}
            onRemove={() => remove(row.api)}
          />
        ))}
      </div>

      <div className="px-xl pt-sm pb-lg">
        <AddFieldButton fields={SF_FIELDS[object].filter((f) => !mapped.has(f.api))} onAdd={add} />
      </div>
    </section>
  );
}

function FieldRow({ sf, row, activities, previewId, onChange, onRemove }: {
  sf: SfField; row: Row; activities: Activity[]; previewId: string; onChange: (s: Source) => void; onRemove: () => void;
}) {
  const s = row.source;
  const p = preview(row, previewId);
  return (
    <div className={cn(COLS, "border-t border-[var(--core-border-main-subtle)] px-xl py-md first:border-t-0")}>
      <div className="flex min-h-[32px] flex-col justify-center">
        <span className="flex items-center gap-xs text-base leading-base text-[var(--core-text-main-primary)]">
          {sf.label}
          {sf.custom && <Badge type="neutral" size="sm">Custom</Badge>}
        </span>
        <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{sf.api}</span>
      </div>
      <span className="flex h-[32px] items-center text-[var(--core-text-main-tertiary)]"><Icon icon={faArrowLeftOutline} size="xs" /></span>

      <div className="flex min-w-0 flex-col gap-xs">
        <ValuePicker sf={sf} source={s} activityCount={activities.length} onChange={onChange} disabled={!!sf.locked} />
        {s.kind === "fixed" && <FixedInput sf={sf} value={s.value} onChange={(v) => onChange({ kind: "fixed", value: v })} />}
        {s.kind === "perActivity" && <PerActivity sf={sf} values={s.values} activities={activities} onChange={(values) => onChange({ kind: "perActivity", values })} />}
        {s.kind === "field" && <Coverage field={s.field} activities={activities} />}
      </div>

      <div className="flex min-h-[32px] min-w-0 items-center">
        {p ? (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base leading-base text-[var(--core-text-main-secondary)]" title={p.text}>{p.text}</span>
            {p.fallback && <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Fallback value</span>}
          </span>
        ) : (
          <span className="text-base leading-base text-[var(--core-text-main-tertiary)] italic">Left empty</span>
        )}
      </div>

      <div className="flex h-[32px] items-center">
        {sf.locked ? (
          <Tooltip>
            <TooltipTrigger asChild><span className="text-[var(--core-text-main-tertiary)]"><Icon icon={faLockOutline} size="sm" /></span></TooltipTrigger>
            <TooltipContent side="left">{sf.locked}</TooltipContent>
          </Tooltip>
        ) : (
          <Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faTrashOutline} aria-label={`Stop writing ${sf.label}`} onClick={onRemove} />
        )}
      </div>
    </div>
  );
}

/** Which activities of this object don't carry the lemlist field, and what fills in for them. */
function Coverage({ field, activities }: { field: string; activities: Activity[] }) {
  const f = lemlistField(field);
  if (!f || f.carriedBy === "all") return null;
  const missing = activities.filter((a) => !f.carriedBy.includes(a.id));
  if (!missing.length) return null;
  const fb = FALLBACK[field] ? lemlistField(FALLBACK[field]!) : undefined;
  const names = missing.length <= 2 ? missing.map((a) => a.label).join(" and ") : `${missing.length} activities`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex w-fit items-center gap-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]">
          <Icon icon={faCircleInfoOutline} size="xxs" />
          {fb ? `${fb.label} for ${names}` : `Left empty for ${names}`}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[300px]">
        {f.label} does not exist on {missing.map((a) => a.label).join(", ")}.{fb ? ` lemlist writes ${fb.label} instead.` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

/** "A value per activity": summary chips, the list unfolds to edit. */
function PerActivity({ sf, values, activities, onChange }: {
  sf: SfField; values: Record<string, string>; activities: Activity[]; onChange: (v: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const counts = new Map<string, number>();
  activities.forEach((a) => { const v = values[a.id] || "Empty"; counts.set(v, (counts.get(v) ?? 0) + 1); });
  return (
    <div className="flex flex-col gap-xs">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-fit flex-wrap items-center gap-xs text-left">
        <Icon icon={open ? faChevronDownOutline : faChevronRightOutline} size="xxs" className="text-[var(--core-text-main-tertiary)]" />
        {[...counts].map(([v, n]) => <Badge key={v} type={v === "Empty" ? "warning" : "neutral"} size="sm">{v} · {n}</Badge>)}
      </button>
      {open && (
        <div className="flex flex-col gap-xs rounded-base bg-[var(--core-bg-main-secondary)] p-base">
          {activities.map((a) => (
            <div key={a.id} className="grid grid-cols-[1fr_160px] items-center gap-base">
              <span className="truncate text-sm leading-sm text-[var(--core-text-main-secondary)]">{a.label}</span>
              <FixedInput sf={sf} size="sm" value={values[a.id] ?? ""} onChange={(v) => onChange({ ...values, [a.id]: v })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddFieldButton({ fields, onAdd }: { fields: SfField[]; onAdd: (api: string) => void }) {
  const [q, setQ] = useState("");
  const match = fields.filter((f) => `${f.label} ${f.api}`.toLowerCase().includes(q.toLowerCase()));
  const groups: [string, SfField[]][] = [["Default fields", match.filter((f) => !f.custom)], ["Custom fields", match.filter((f) => f.custom)]];
  return (
    <DropdownMenuRoot onOpenChange={(o) => { if (!o) setQ(""); }}>
      <DropdownMenuTrigger asChild>
        <Button appearance="ghost" intent="brand" size="sm" leftIcon={faPlusOutline} disabled={!fields.length}>Add a Salesforce field</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuSearch value={q} onValueChange={setQ} onClear={() => setQ("")} placeholder="Search a Salesforce field" onKeyDown={(e) => e.stopPropagation()} />
        <DropdownMenuList>
          {groups.map(([g, list]) => list.length > 0 && (
            <div key={g} className="contents">
              <DropdownMenuHeading className="[&_span]:normal-case">{g}</DropdownMenuHeading>
              {list.map((f) => <DropdownMenuRadixItem key={f.api} label={f.label} sublabel={f.api} onSelect={() => onAdd(f.api)} />)}
            </div>
          ))}
        </DropdownMenuList>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
