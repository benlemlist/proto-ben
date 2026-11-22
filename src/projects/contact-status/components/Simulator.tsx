// "Try on a contact": fire lead events on one contact and watch its contact status and its
// property history (in scope: "why did it change?"). Uses the draft mapping, so a mapping can be
// tested before it is saved.
import { useState } from "react";
import {
  SidePanel, SidePanelContent, ModalBody, ObjectPanelHeader, StatusPill, Badge, Button, Switch, Avatar, getAvatarTone,
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

  const history = showIgnored ? sim.history : sim.history.filter((h) => h.applied || h.source === "new_lead");

  return (
    <SidePanel open={s.simOpen} onOpenChange={s.setSimOpen}>
      <SidePanelContent className="w-[480px]">
        <ObjectPanelHeader
          type="contact"
          name={SIM_CONTACT.name}
          initials={SIM_CONTACT.initials}
          tone={getAvatarTone(SIM_CONTACT.email)}
          role={`${SIM_CONTACT.role} at`}
          company={{ label: SIM_CONTACT.company, initials: "NW" }}
          crm={cfg.crmFieldId ? { label: `Synced to ${crmName}` } : undefined}
          onClose={() => s.setSimOpen(false)}
        />
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            {s.dirty && <Badge type="warning" size="sm">Testing your unsaved changes</Badge>}

            <div className="flex flex-col gap-base rounded-lg border border-[var(--core-border-main-subtle)] p-xl">
              <Muted>Contact status</Muted>
              <div className="flex items-center gap-base">
                {current ? <StatusPill type={current.color} size="lg">{current.name}</StatusPill> : <span className="text-base leading-base text-[var(--core-text-main-tertiary)]">No status yet</span>}
                {current && <Muted>{current.column === "exit" ? "Exit" : current.column === "path" ? `Stage ${cfg.statuses.filter((x) => x.column === "path").findIndex((x) => x.id === current.id) + 1} of ${cfg.statuses.filter((x) => x.column === "path").length}` : "Not in the lifecycle"}</Muted>}
              </div>
              <div className="flex items-center gap-xs">
                <Muted>Current campaign:</Muted>
                <span className="text-sm leading-sm text-[var(--core-text-main-primary)]">{lead.campaign}</span>
                {lead.lockedBy && <Badge type="neutral" size="sm">Set {lead.lockedBy === "crm" ? `by ${crmName}` : "by hand"}</Badge>}
              </div>
            </div>

            <div className="flex flex-col gap-base">
              <span className="text-sm leading-sm font-medium text-[var(--core-text-main-secondary)]">Something happens</span>
              <div className="flex flex-wrap gap-xs">
                {MOVING_OUTCOMES.map((o) => {
                  const target = cfg.enabled ? cfg.mapping[o.id] : null;
                  return (
                    <Button key={o.id} appearance="outlined" intent="brand" size="sm" onClick={() => s.setSim(fireEvent(sim, cfg, o.id))}>
                      <span className="inline-flex items-center gap-xs">{target && st(target) && <Dot color={st(target)!.color} />}{o.label}</span>
                    </Button>
                  );
                })}
                <DropdownMenuRoot>
                  <DropdownMenuTrigger asChild><Button appearance="ghost" intent="brand" size="sm">Team or lemlist event…</Button></DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px]">
                    <DropdownMenuList>
                      {STILL_OUTCOMES.map((o) => <DropdownMenuRadixItem key={o.id} label={o.label} onSelect={() => s.setSim(fireEvent(sim, cfg, o.id))} />)}
                    </DropdownMenuList>
                  </DropdownMenuContent>
                </DropdownMenuRoot>
              </div>
              <div className="flex flex-wrap gap-xs">
                <Button appearance="outlined" intent="brand" size="sm" leftIcon={faPlusOutline} onClick={() => s.setSim(newLead(sim, SIM_CAMPAIGNS[sim.leads.length % SIM_CAMPAIGNS.length]))}>Add to a new campaign</Button>
                <DropdownMenuRoot>
                  <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="sm" leftIcon={faCopyOutline}>{crmName} changes it…</Button></DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px]">
                    <DropdownMenuList>
                      <DropdownMenuHeading>A rep calls from a dialer not in lemlist</DropdownMenuHeading>
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

            <div className="flex flex-col gap-base">
              <div className="flex items-center gap-base">
                <Icon icon={faClockRotateLeftOutline} size="sm" className="text-[var(--core-text-main-secondary)]" />
                <span className="flex-1 text-base leading-base font-medium text-[var(--core-text-main-primary)]">Contact status history</span>
                <Switch label="Show ignored events" checked={showIgnored} onCheckedChange={setShowIgnored} />
              </div>
              {history.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--core-border-main-primary)] p-xl text-center"><Muted>Fire an event above. Every change, and why, shows here.</Muted></div>
              ) : (
                <ol className="flex flex-col">
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
