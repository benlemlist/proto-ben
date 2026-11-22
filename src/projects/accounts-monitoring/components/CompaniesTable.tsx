// CRM companies grid. The "Signals" column is where V1 and V2 differ:
// - V1 (Maxime L): "Active signals", a "Monitor signals" chip in every empty cell + an icon in the header.
// - V2 (Ben): one cell = monitoring state (radar + number of agents) + the signals received, hover card for details.
import {
  Avatar, Badge, BadgeSpecific, getAvatarTone, Checkbox, HoverCard, HoverCardContent, HoverCardTrigger, Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, cn,
} from "@l3mpire/ui";
import { Icon } from "@l3mpire/icons";
import { useMonitoring } from "../store";
import { STATUS_BADGE, fa, signal, type Company, type FiredSignal } from "../data";

const Muted = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("text-sm leading-sm text-[var(--core-text-main-tertiary)]", className)}>{children}</span>
);

const ago = (d: number) => (d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);

function SignalChip({ s }: { s: FiredSignal }) {
  const def = signal(s.type);
  return <Badge type={def.badge} size="md" icon={def.icon}>{def.label}</Badge>;
}

export function CompaniesTable({ companies }: { companies: Company[] }) {
  const s = useMonitoring();
  const v2 = s.version === "v2";
  const allOn = companies.length > 0 && companies.every((c) => s.selected.includes(c.id));
  const toggle = (id: string, on: boolean) => s.setSelected((xs) => (on ? [...xs, id] : xs.filter((x) => x !== id)));

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox checked={allOn} onCheckedChange={(v) => s.setSelected(v ? companies.map((c) => c.id) : [])} />
            </TableHead>
            <TableHead>Company name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Company status</TableHead>
            <TableHead>Contact suggestions</TableHead>
            <TableHead className="min-w-[300px]">
              {v2 ? (
                <span className="flex items-center gap-xs"><Icon icon={fa("radar")} size="xs" label="" /> Signals</span>
              ) : (
                <span className="flex items-center justify-between gap-xs">
                  <span className="flex items-center gap-xs"><Icon icon={fa("bullseye")} size="xs" label="" /> Active signals</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" onClick={s.openV1} className="rounded-base p-2xs text-[var(--core-text-main-secondary)] hover:bg-[var(--core-bg-main-hover)]" aria-label="Monitor signals">
                        <Icon icon={fa("bullseye")} size="xs" label="" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Monitor signals</TooltipContent>
                  </Tooltip>
                </span>
              )}
            </TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => {
            const on = s.selected.includes(c.id);
            return (
              <TableRow key={c.id} data-state={on ? "selected" : undefined}>
                <TableCell><Checkbox checked={on} onCheckedChange={(v) => toggle(c.id, v === true)} /></TableCell>
                <TableCell>
                  <span className="flex items-center gap-base whitespace-nowrap">
                    <Avatar size="sm" shape="squared" tone={getAvatarTone(c.id)} initials={c.name.slice(0, 2).toUpperCase()} />
                    <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{c.name}</span>
                  </span>
                </TableCell>
                <TableCell><span className="text-base leading-base whitespace-nowrap text-[var(--core-text-functional-info)] underline">{c.domain}</span></TableCell>
                <TableCell><Badge type={STATUS_BADGE[c.status]} size="md">{c.status}</Badge></TableCell>
                <TableCell>
                  {c.contact ? (
                    <span className="flex items-center gap-xs whitespace-nowrap">
                      <Badge type="neutral" size="md" avatar={<Avatar size="sm" initials={c.contact.split(" ").map((w) => w[0]).join("")} />}>{c.contact}</Badge>
                      {c.contactCount > 1 && <Badge type="neutral" size="md">+{c.contactCount - 1}</Badge>}
                    </span>
                  ) : <Muted>—</Muted>}
                </TableCell>
                <TableCell>{v2 ? <SignalsCellV2 company={c} /> : <SignalsCellV1 company={c} />}</TableCell>
                <TableCell><span className="text-base leading-base whitespace-nowrap">{c.industry}</span></TableCell>
                <TableCell><span className="text-base leading-base whitespace-nowrap">{c.size}</span></TableCell>
                <TableCell><span className="text-base leading-base whitespace-nowrap">{c.owner}</span></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}

/** V1 — as in the Figma: received signals, otherwise a "Monitor signals" chip that opens the agent. */
function SignalsCellV1({ company }: { company: Company }) {
  const s = useMonitoring();
  // V1 has no deploy step: only the signals the account already had.
  const sigs = company.fired;
  if (!sigs.length) {
    return (
      <button type="button" onClick={s.openV1} className="rounded-full">
        <Badge type="neutral" size="md" icon={fa("bullseye")}>Monitor signals</Badge>
      </button>
    );
  }
  return (
    <span className="flex items-center gap-xs whitespace-nowrap">
      <SignalChip s={sigs[0]} />
      {sigs.length > 1 && <Badge type="neutral" size="md">+{sigs.length - 1}</Badge>}
    </span>
  );
}

/** V2 — monitoring state first (radar + agents), then received signals. Hover = what is watched and what fired. */
function SignalsCellV2({ company }: { company: Company }) {
  const s = useMonitoring();
  const sigs = s.signalsOf(company.id);
  const wls = s.watchlistsOf(company.id);
  if (!sigs.length && !wls.length) return <Muted>Not monitored</Muted>;

  return (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild>
        <span className="flex cursor-default items-center gap-xs whitespace-nowrap">
          {wls.length > 0 && (
            <span className="flex items-center gap-2xs rounded-full px-xs text-sm leading-sm font-medium text-[var(--core-text-functional-success)]">
              <Icon icon={fa("radar")} size="xs" label="" />{wls.length}
            </span>
          )}
          {sigs.length > 0 ? (
            <>
              <SignalChip s={sigs[0]} />
              {sigs[0].daysAgo === 0 && <BadgeSpecific type="new">New</BadgeSpecific>}
              {sigs.length > 1 && <Badge type="neutral" size="md">+{sigs.length - 1}</Badge>}
            </>
          ) : <Muted>No signal yet</Muted>}
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start">
        <div className="flex w-[320px] flex-col gap-lg p-lg">
          <div className="flex flex-col gap-sm">
            <span className="text-sm leading-sm font-semibold text-[var(--core-text-main-tertiary)]">
              {wls.length ? `Monitored by ${wls.length} agent${wls.length > 1 ? "s" : ""}` : "Not monitored"}
            </span>
            {wls.map((w) => (
              <span key={w.id} className="flex items-center justify-between gap-base text-base leading-base">
                <span className="flex min-w-0 items-center gap-xs"><Icon icon={signal(w.type).icon} size="xs" label="" /><span className="truncate">{w.name}</span></span>
                {w.createdBy === "lemAgent" && <Badge type="ai" size="sm" icon={fa("sparkles")}>lemAgent</Badge>}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-sm">
            <span className="text-sm leading-sm font-semibold text-[var(--core-text-main-tertiary)]">Signals received</span>
            {sigs.length ? sigs.map((x) => (
              <span key={x.type} className="flex flex-col gap-2xs">
                <span className="flex items-center justify-between gap-base"><SignalChip s={x} /><Muted>{ago(x.daysAgo)}</Muted></span>
                <span className="text-sm leading-sm text-[var(--core-text-main-secondary)]">{x.detail}</span>
              </span>
            )) : <Muted>Nothing yet. Agents check every day.</Muted>}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
