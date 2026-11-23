import { useState, type ReactNode } from "react";
import { Select, DropdownMenu, DropdownMenuList, DropdownMenuItem, DropdownMenuDelimiter, DropdownMenuHeading, cn, type StatusPillType } from "@l3mpire/ui";
import { Icon, type IconDefinition } from "@l3mpire/icons";
import type { ContactStatus } from "../data";

export const Dot = ({ color, className }: { color: StatusPillType; className?: string }) => (
  <span className={cn("inline-block size-[8px] shrink-0 rounded-full", className)} style={{ background: `var(--comp-badge-${color}-text)` }} />
);

export const Muted = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("text-sm leading-sm text-[var(--core-text-main-tertiary)]", className)}>{children}</span>
);

export function Card({ icon, title, description, action, children, className }: { icon: IconDefinition; title: string; description: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)]", className)}>
      <header className="flex items-center gap-lg border-b border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] px-xl py-lg">
        <Icon icon={icon} size="md" className="text-[var(--core-text-main-secondary)]" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{title}</span>
          <Muted>{description}</Muted>
        </div>
        {action}
      </header>
      <div className="p-xl">{children}</div>
    </section>
  );
}

// Contact status picker (Events table, simulator). Only path and exit statuses can be targets.
export function StatusSelect({ statuses, value, onChange, disabled, noneLabel = "No effect", size = "md", placeholder }: {
  statuses: ContactStatus[]; value: string | null; onChange: (id: string | null) => void; disabled?: boolean; noneLabel?: string | null; size?: "sm" | "md"; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = statuses.find((s) => s.id === value);
  const path = statuses.filter((s) => s.column === "path");
  const exits = statuses.filter((s) => s.column === "exit");
  const pick = (id: string | null) => { onChange(id); setOpen(false); };
  return (
    <Select
      size={size}
      value={current?.name ?? (placeholder ? undefined : noneLabel ?? undefined)}
      placeholder={placeholder ?? noneLabel ?? undefined}
      avatar={current ? <Dot color={current.color} /> : undefined}
      isOpen={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <DropdownMenu className="w-[240px]">
        <DropdownMenuList>
          {path.length > 0 && <DropdownMenuHeading className="[&_span]:normal-case">Lifecycle path</DropdownMenuHeading>}
          {path.map((s) => <DropdownMenuItem key={s.id} label={s.name} avatar={<Dot color={s.color} />} selected={s.id === value} onClick={() => pick(s.id)} />)}
          {exits.length > 0 && <DropdownMenuHeading className="[&_span]:normal-case">Exits</DropdownMenuHeading>}
          {exits.map((s) => <DropdownMenuItem key={s.id} label={s.name} avatar={<Dot color={s.color} />} selected={s.id === value} onClick={() => pick(s.id)} />)}
          {noneLabel && (
            <>
              <DropdownMenuDelimiter bleed />
              <DropdownMenuItem label={noneLabel} description="Lead status still changes and reaches your CRM." selected={value === null} onClick={() => pick(null)} />
            </>
          )}
        </DropdownMenuList>
      </DropdownMenu>
    </Select>
  );
}
