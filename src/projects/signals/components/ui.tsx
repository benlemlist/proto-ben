// Shared parts of the Signals proto, mirroring prod watch-list components:
// Section = UiCollapse · Field = input-label + text-light · Pills = UiCheckboxPillGroup ·
// UrlList = WatchListValuesSelector · IncludeExclude = WatchListAutocomplete (include / exclude).
import { useState, type ReactNode } from "react";
import { Button, Badge, TextArea, MultiSelect, cn } from "@l3mpire/ui";
import { Icon, faChevronDownOutline, faChevronRightOutline, faCheckOutline } from "@l3mpire/icons";

export const Muted = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("text-sm leading-sm text-[var(--core-text-main-tertiary)]", className)}>{children}</span>
);

/** Prod `UiCollapse`: bordered card, icon + title header, chevron, open by default. */
export function Section({ icon, title, right, children, defaultOpen = true, className }: { icon: string; title: string; right?: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn("rounded-lg border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]", className)}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-base px-xl py-lg text-left">
        <Icon icon={icon} size="sm" className="text-[var(--core-text-main-secondary)]" />
        <span className="flex-1 text-base leading-base font-medium text-[var(--core-text-main-primary)]">{title}</span>
        {right}
        <Icon icon={open ? faChevronDownOutline : faChevronRightOutline} size="sm" className="text-[var(--core-text-main-tertiary)]" />
      </button>
      {open && <div className="flex flex-col gap-xl border-t border-[var(--core-border-main-subtle)] px-xl py-xl">{children}</div>}
    </section>
  );
}

export function Field({ label, description, required, children, aside }: { label: string; description?: ReactNode; required?: boolean; children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-end gap-base">
        <div className="flex min-w-0 flex-1 flex-col gap-2xs">
          <span className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">
            {label}{required && <span className="text-[var(--core-text-alert-primary,var(--comp-badge-critical-text))]"> *</span>}
          </span>
          {description && <Muted>{description}</Muted>}
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** Prod `UiCheckboxPillGroup`: toggle pills, several can be on. */
export function Pills({ options, values, onChange }: { options: { value: string; label: string }[]; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-sm">
      {options.map((o) => {
        const on = values.includes(o.value);
        return (
          <button key={o.value} type="button" onClick={() => onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])}
            className={cn("flex items-center gap-xs rounded-full border px-lg py-xs text-base leading-base",
              on ? "border-[var(--core-border-main-selected)] bg-[var(--core-bg-main-selected,var(--core-bg-main-hover))] text-[var(--core-text-main-primary)]"
                 : "border-[var(--core-border-main-subtle)] text-[var(--core-text-main-secondary)] hover:bg-[var(--core-bg-main-hover)]")}>
            {on && <Icon icon={faCheckOutline} size="xxs" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Prod `WatchListValuesSelector`: paste one value per line → "Add", validated values listed as chips, discarded ones explained. */
export function UrlList({ label, placeholder, values, onChange, validate, max, addLabel, counter }: {
  label: string; placeholder: string; values: string[]; onChange: (v: string[]) => void;
  validate: (v: string, all: string[]) => string | null; max: number; addLabel: string; counter: (n: number) => string;
}) {
  const [text, setText] = useState("");
  const [discarded, setDiscarded] = useState<{ value: string; error: string }[]>([]);
  const add = () => {
    const next = [...values];
    const bad: { value: string; error: string }[] = [];
    text.split(/\n|,/).map((x) => x.trim()).filter(Boolean).forEach((raw) => {
      const v = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
      const err = next.length >= max ? "Maximum reached" : validate(v, next);
      if (err) bad.push({ value: raw, error: err }); else next.push(v);
    });
    onChange(next);
    setDiscarded(bad);
    setText("");
  };
  return (
    <div className="flex flex-col gap-base">
      <div className="flex flex-col gap-sm">
        <TextArea label={label} placeholder={placeholder} value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} rows={3} />
        <div className="flex items-center justify-between gap-base">
          <Muted>{counter(values.length)}</Muted>
          <Button appearance="outlined" intent="brand" size="sm" disabled={!text.trim()} onClick={add}>{addLabel}</Button>
        </div>
      </div>
      {discarded.length > 0 && (
        <Muted className="text-[var(--comp-badge-critical-text)]">
          {discarded.length} discarded: {discarded.map((d) => `${d.value} (${d.error})`).join(", ")}
        </Muted>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-xs">
          {values.map((v) => <Badge key={v} type="neutral" size="md" onClose={() => onChange(values.filter((x) => x !== v))}>{v}</Badge>)}
        </div>
      )}
    </div>
  );
}

/** Prod `WatchListAutocomplete` with include/exclude: two lemDS MultiSelect side by side. */
export function IncludeExclude({ label, description, options, value, onChange }: {
  label: string; description: string; options: string[]; value: { in: string[]; out: string[] }; onChange: (v: { in: string[]; out: string[] }) => void;
}) {
  const opts = options.map((o) => ({ value: o, label: o }));
  return (
    <Field label={label} description={description}>
      <div className="grid grid-cols-2 gap-base">
        <MultiSelect size="md" label="Include" placeholder="Any" options={opts.filter((o) => !value.out.includes(o.value))} value={value.in} onValueChange={(v) => onChange({ ...value, in: v })} />
        <MultiSelect size="md" label="Exclude" placeholder="None" options={opts.filter((o) => !value.in.includes(o.value))} value={value.out} onValueChange={(v) => onChange({ ...value, out: v })} />
      </div>
    </Field>
  );
}

/** Prod `WatchListSummaryEntry`: label on the left, value on the right. */
export function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-xl py-sm">
      <span className="w-[200px] shrink-0 text-base leading-base text-[var(--core-text-main-tertiary)]">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-xs text-base leading-base text-[var(--core-text-main-primary)]">{children}</div>
    </div>
  );
}

/** Heat score bar (new on forecast / Rodz signals: 0–100). */
export function Heat({ value }: { value: number }) {
  const tone = value >= 80 ? "critical" : value >= 65 ? "orange" : "amber";
  return (
    <div className="flex items-center gap-base">
      <div className="h-[6px] w-[120px] overflow-hidden rounded-full bg-[var(--core-bg-main-tertiary,var(--core-bg-main-hover))]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: `var(--comp-badge-${tone}-text)` }} />
      </div>
      <span className="text-base leading-base font-medium">{value}</span>
      <Muted>/ 100</Muted>
    </div>
  );
}
