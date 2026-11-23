// "Try on a contact": fire lead events on one contact and watch its contact status and its
// property history (in scope: "why did it change?"). Uses the draft mapping, so a mapping can be
// tested before it is saved.
import { useState } from "react";
import {
  SidePanel, SidePanelContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, StatusPill, Badge, Button, Switch, Avatar, getAvatarTone,
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuList, DropdownMenuRadixItem, DropdownMenuHeading, cn,
} from "@l3mpire/ui";
import { Icon, type IconDefinition, faBoltOutline, faPlusOutline, faPenOutline, faClockRotateLeftOutline, faPaperPlaneTopOutline, faCopyOutline } from "@l3mpire/icons";
import { useCS } from "../store";
import { MOVING_OUTCOMES, STILL_OUTCOMES, SIM_CONTACT, SIM_CAMPAIGNS, CRM_FIELDS } from "../data";
import { fireEvent, newLead, setFromOutside, fmtDate, type HistoryEntry } from "../logic";
import { Muted, Dot } from "./shared";

const SOURCE: Record<HistoryEntry["source"], { label: string; icon: IconDefinition }> = {
  event: { label: "Lead event", icon: faBoltOutline },
  crm: { label: "HubSpot", icon: faCopyOutline },
  manual: { label: "Manual", icon: faPenOutline },
  new_lead: { label: "New campaign", icon: faPaperPlaneTopOutline },
};

export function Simulator() {
  const s = useCS();
  const cfg = s.draft;
  const sim = s.sim;
  const [showIgnored, setShowIgnored] = useState(true);
  const st = (id: string | null) => cfg.statuses.find((x) => x.id === id);
  const current = st(sim.status);
  const lead = sim.leads[sim.leads.length - 1];
  const crmName = CRM_FIELDS.find((f) => f.id === cfg.crmFieldId)?.crm ?? "HubSpot";
  const targets = cfg.statuses.filter((x) => x.column !== "unused").concat(cfg.statuses.filter((x) => x.column === "unused"));

  const pill = (id: string | null) => {
    const x = st(id);
    return x ? <StatusPill type={x.color} size="sm">{x.name}</StatusPill> : <Muted>No status</Muted>;
  };

  // Campaign events grouped by the status they lead to: path then exits, then "No effect".
  const lifecycle = cfg.statuses.filter((x) => x.column === "path").concat(cfg.statuses.filter((x) => x.column === "exit"));
  const targetOf = (oid: string) => (cfg.enabled ? st(cfg.mapping[oid] ?? null) ?? null : null);
  const eventRows = [
    ...lifecycle.map((x) => ({ key: x.id, status: x as typeof x | null, outcomes: MOVING_OUTCOMES.filter((o) => targetOf(o.id)?.id === x.id) })).filter((r) => r.outcomes.length > 0),
    { key: "none", status: null, outcomes: MOVING_OUTCOMES.filter((o) => !targetOf(o.id) || targetOf(o.id)!.column === "unused") },
  ];

  const history = showIgnored ? sim.history : sim.history.filter((h) => h.applied || h.source === "new_lead");

  return (
    <SidePanel open={s.simOpen} onOpenChange={s.setSimOpen}>
      <SidePanelContent className="w-[480px]">
        <ModalHeader onClose={() => s.setSimOpen(false)}>
          <ModalTitle>Try on a contact</ModalTitle>
          <ModalDescription>Fire events on a test contact to check your setup. Nothing changes in your data.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            {s.dirty && <Badge type="warning" size="sm">Testing your unsaved changes</Badge>}

            {/* 1. The contact: who, its contact status, the campaign it is in. */}
            <div className="flex flex-col rounded-lg border border-[var(--core-border-main-subtle)]">
              <div className="flex items-center gap-base px-xl py-lg">
                <Avatar size="xl" initials={SIM_CONTACT.initials} tone={getAvatarTone(SIM_CONTACT.email)} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{SIM_CONTACT.name}</span>
                  <Muted>{SIM_CONTACT.role} at {SIM_CONTACT.company}</Muted>
                </div>
                {s.dirty && <Badge type="warning" size="sm">Unsaved setup</Badge>}
              </div>
              <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-x-base gap-y-sm border-t border-[var(--core-border-main-subtle)] px-xl py-lg">
                <Muted>Contact status</Muted>
                <div className="flex items-center gap-base">
                  {current ? <StatusPill type={current.color} size="md">{current.name}</StatusPill> : <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">No status yet</span>}
                  {current && <Muted>{current.column === "exit" ? "Exit" : current.column === "path" ? `Stage ${cfg.statuses.filter((x) => x.column === "path").findIndex((x) => x.id === current.id) + 1} of ${cfg.statuses.filter((x) => x.column === "path").length}` : "Not in the lifecycle"}</Muted>}
                  {lead.lockedBy && <Badge type="neutral" size="sm">Set {lead.lockedBy === "crm" ? `by ${crmName}` : "by hand"}</Badge>}
                </div>
                <Muted>Campaign</Muted>
                <span className="truncate text-sm leading-sm text-[var(--core-text-main-primary)]">{lead.campaign}</span>
              </div>
            </div>

            {/* 2. The simulation: what can happen to Theresa. */}
            <div className="flex flex-col rounded-lg border border-[var(--core-border-main-subtle)]">
              <div className="flex flex-col border-b border-[var(--core-border-main-subtle)] px-xl py-lg">
                <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">Simulate what happens to Theresa</span>
                <Muted>Pick an event and watch her contact status and its history.</Muted>
              </div>
              <div className="flex flex-col gap-xl p-xl">
                {/* In the campaign: each event sits next to the status it leads to, in lifecycle order,
                    so the effect of a click is visible before clicking. */}
                <div className="flex flex-col gap-base">
                  <div className="flex flex-col">
                    <span className="text-sm leading-sm font-medium text-[var(--core-text-main-secondary)]">A campaign event</span>
                    <Muted>Theresa moves to the status on the left, if the rules allow it.</Muted>
                  </div>
                  <div className="flex flex-col rounded-lg border border-[var(--core-border-main-subtle)]">
                    {eventRows.map((r, i) => (
                      <div
                        key={r.key}
                        className={cn(
                          "grid grid-cols-[112px_minmax(0,1fr)] items-start gap-base px-lg py-base",
                          i > 0 && "border-t border-[var(--core-border-main-subtle)]",
                          r.status && r.status.id === sim.status && "bg-[var(--core-bg-main-secondary)]",
                        )}
                      >
                        <div className="flex min-h-[28px] items-center gap-xs">
                          {r.status ? <StatusPill type={r.status.color} size="sm">{r.status.name}</StatusPill> : <Muted>No effect</Muted>}
                        </div>
                        <div className="flex flex-wrap gap-xs">
                          {r.outcomes.map((o) => (
                            <Button key={o.id} appearance="outlined" intent="brand" size="sm" onClick={() => s.setSim(fireEvent(sim, cfg, o.id))}>{o.label}</Button>
                          ))}
                          {!r.status && (
                            <DropdownMenuRoot>
                              <DropdownMenuTrigger asChild><Button appearance="ghost" intent="brand" size="sm">Team or lemlist event…</Button></DropdownMenuTrigger>
                              <DropdownMenuContent className="w-[220px]">
                                <DropdownMenuList>
                                  {STILL_OUTCOMES.map((o) => <DropdownMenuRadixItem key={o.id} label={o.label} onSelect={() => s.setSim(fireEvent(sim, cfg, o.id))} />)}
                                </DropdownMenuList>
                              </DropdownMenuContent>
                            </DropdownMenuRoot>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outside the campaign: what can change the status without a lead event. */}
                <div className="flex flex-col gap-base">
                  <div className="flex flex-col">
                    <span className="text-sm leading-sm font-medium text-[var(--core-text-main-secondary)]">Something outside the campaign</span>
                    <Muted>Another campaign, your CRM or a teammate.</Muted>
                  </div>
                  <div className="flex flex-wrap gap-xs">
                    <Button appearance="outlined" intent="brand" size="sm" leftIcon={faPlusOutline} onClick={() => s.setSim(newLead(sim, SIM_CAMPAIGNS[sim.leads.length % SIM_CAMPAIGNS.length]))}>Add to a new campaign</Button>
                    <DropdownMenuRoot>
                      <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="sm" leftIcon={faCopyOutline}>{crmName} changes it…</Button></DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px]">
                        <DropdownMenuList>
                          <DropdownMenuHeading className="[&_span]:normal-case">A rep calls from a dialer not in lemlist</DropdownMenuHeading>
                          {targets.map((x) => <DropdownMenuRadixItem key={x.id} label={x.name} avatar={<Dot color={x.color} />} onSelect={() => s.setSim(setFromOutside(sim, cfg, "crm", x.id))} />)}
                        </DropdownMenuList>
                      </DropdownMenuContent>
                    </DropdownMenuRoot>
                    <DropdownMenuRoot>
                      <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="sm" leftIcon={faPenOutline}>Set by hand…</Button></DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[220px]">
                        <DropdownMenuList>
                          {targets.map((x) => <DropdownMenuRadixItem key={x.id} label={x.name} avatar={<Dot color={x.color} />} onSelect={() => s.setSim(setFromOutside(sim, cfg, "manual", x.id))} />)}
                        </DropdownMenuList>
                      </DropdownMenuContent>
                    </DropdownMenuRoot>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. History, not boxed. */}
            <div className="flex flex-col gap-base">
              <div className="flex items-center gap-base">
                <Icon icon={faClockRotateLeftOutline} size="sm" className="text-[var(--core-text-main-secondary)]" />
                <span className="flex-1 text-base leading-base font-medium text-[var(--core-text-main-primary)]">Contact status history</span>
                <Switch label="Show ignored events" checked={showIgnored} onCheckedChange={setShowIgnored} />
              </div>
              {history.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--core-border-main-primary)] p-xl text-center"><Muted>Fire an event above. Every change, and why, shows here.</Muted></div>
              ) : (
                <ol className="flex flex-col pl-[10px]">
                  {history.map((h) => {
                    const src = SOURCE[h.source];
                    const changed = h.applied && h.from !== h.to;
                    return (
                      <li key={h.id} className={cn("flex gap-lg border-l border-[var(--core-border-main-subtle)] pb-xl pl-lg", !h.applied && h.source !== "new_lead" && "opacity-60")}>
                        <span className="-ml-[23px] flex size-[20px] shrink-0 items-center justify-center rounded-full border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] text-[var(--core-text-main-secondary)]">
                          {h.source === "manual" ? <Avatar size="sm" initials="AD" /> : <Icon icon={src.icon} size="xxs" />}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-xs">
                          <div className="flex flex-wrap items-center gap-xs">
                            {changed ? (<>{pill(h.from)}<span className="text-sm text-[var(--core-text-main-tertiary)]">→</span>{pill(h.to)}</>) : (
                              <span className="text-sm leading-sm text-[var(--core-text-main-secondary)]">{h.source === "new_lead" ? "Added to a campaign" : "No change"}</span>
                            )}
                          </div>
                          <span className="text-sm leading-sm text-[var(--core-text-main-primary)]">
                            {src.label}: {h.detail}
                            {h.source === "event" && <span className="text-[var(--core-text-main-tertiary)]"> · {sim.leads[h.leadIndex]?.campaign}</span>}
                          </span>
                          {h.reason && <Muted>{h.reason}</Muted>}
                          <Muted className="text-xs leading-xs">{fmtDate(h.at)}</Muted>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              {sim.history.length > 0 && <div><Button appearance="ghost" intent="brand" size="sm" onClick={s.resetSim}>Start over</Button></div>}
            </div>
          </div>
        </ModalBody>
      </SidePanelContent>
    </SidePanel>
  );
}
