// V1 — Maxime L's first iteration, reproduced as in Figma (Signal-based prospection › "Companies page").
// The flow stops at the suggestions: "Review signal agents" has no screen yet, so it says so.
import { useState } from "react";
import { Badge, Button, TextArea } from "@l3mpire/ui";
import { Icon, faArrowUpOutline, faChevronDownOutline, faChevronUpOutline, faPenOutline, faPlusOutline, faXmarkOutline } from "@l3mpire/icons";
import { useNavigate } from "react-router";
import { useMonitoring } from "../store";
import { fa } from "../data";

export function AgentPanelV1() {
  const s = useMonitoring();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <aside className="flex w-[350px] shrink-0 flex-col border-r border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]">
      <div className="flex h-[44px] items-center justify-between gap-base border-b border-[var(--core-border-main-subtle)] px-lg">
        <span className="flex items-center gap-xs text-base leading-base font-medium text-[var(--core-text-main-primary)]">
          <Icon icon={fa("sparkles")} size="xs" label="" /> New chat <Icon icon={faChevronDownOutline} size="xxs" label="" />
        </span>
        <span className="flex items-center gap-2xs">
          <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faPlusOutline} aria-label="New chat" />
          <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faXmarkOutline} aria-label="Close lemAgent" onClick={s.closePanel} />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-auto px-lg py-lg">
        <span className="mt-auto flex items-center gap-xs text-base leading-base text-[var(--core-text-main-secondary)]">
          <span className="h-[4px] w-[4px] rounded-full bg-[var(--core-text-main-tertiary)]" />
          Loaded <Icon icon={fa("puzzle-piece")} size="xs" label="" /> <span className="font-medium text-[var(--core-text-main-primary)]">Signal agents</span> skill
        </span>

        <div className="flex flex-col rounded-lg border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)]">
          <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-base px-lg py-base">
            <span className="flex items-center gap-sm text-base leading-base font-medium text-[var(--core-text-main-primary)]">
              <Icon icon={fa("bullseye")} size="xs" label="" /> {s.v1Cards.length} agents suggested
            </span>
            <Icon icon={open ? faChevronUpOutline : faChevronDownOutline} size="xs" label="" />
          </button>
          {open && (
            <div className="flex flex-col gap-base px-base pb-base">
              {s.v1Cards.map((c) => (
                <div key={c.id} role="button" tabIndex={0} onClick={() => s.toggleV1Card(c.id)} onKeyDown={(e) => e.key === "Enter" && s.toggleV1Card(c.id)}
                  className={`flex cursor-pointer flex-col gap-sm rounded-lg border bg-[var(--core-bg-main-primary)] p-lg ${c.selected ? "border-[var(--core-border-main-selected)]" : "border-[var(--core-border-main-subtle)]"}`}>
                  <div className="flex items-center gap-sm">
                    {/* Radio look, as in the Figma (even though several can be picked). */}
                    <span className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border ${c.selected ? "border-[var(--core-border-main-selected)]" : "border-[var(--core-border-main-secondary)]"}`}>
                      {c.selected && <span className="h-[8px] w-[8px] rounded-full bg-[var(--core-border-main-selected)]" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-base leading-base font-medium text-[var(--core-text-main-primary)]">{c.name}</span>
                    <span onClick={(e) => e.stopPropagation()} className="flex">
                      <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faPenOutline} aria-label="Edit"
                        onClick={() => s.toast({ type: "info", title: "Edit agent", subtitle: "Not designed in V1." })} />
                      <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faXmarkOutline} aria-label="Remove" onClick={() => s.removeV1Card(c.id)} />
                    </span>
                  </div>
                  <div className="pl-[22px]"><Badge type={c.badge.type} size="sm" icon={c.badge.icon}>{c.badge.label}</Badge></div>
                  <span className="pl-[22px] text-sm leading-sm text-[var(--core-text-main-tertiary)]">100 credits/signal • Approx. 340 signals/month</span>
                </div>
              ))}
              <Button appearance="solid" intent="brand" size="md" className="w-full"
                onClick={() => s.toast({ type: "info", title: "Review signal agents", subtitle: "The review modal and the deploy step are not designed in V1." })}>
                Review signal agents
              </Button>
              <Button appearance="outlined" intent="brand" size="md" className="w-full" onClick={() => navigate("/signals")}>Setup manually</Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-lg">
        <div className="flex flex-col gap-sm rounded-lg border border-[var(--core-border-main-subtle)] p-base">
          <TextArea placeholder="Describe the action to take..." />
          <div className="flex justify-end">
            <Button appearance="solid" intent="brand" size="sm" iconOnly leftIcon={faArrowUpOutline} aria-label="Send" disabled />
          </div>
        </div>
      </div>
    </aside>
  );
}
