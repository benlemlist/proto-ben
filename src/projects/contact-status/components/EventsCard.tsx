// "Events" card (Figma Layout 2): the 80 lead events grouped into 15 outcomes. Only what the
// contact did can move a contact status; team actions and technical failures never do.
import { Button, Badge, InfoMessage, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Select, cn } from "@l3mpire/ui";
import { Icon, faBoltOutline, faStarsOutline, faUserOutline, faPlayOutline, faCircleSmallSolid, faChevronDownOutline, faChevronUpOutline } from "@l3mpire/icons";
import { useLayoutEffect, useRef, useState } from "react";
import { useCS } from "../store";
import { MOVING_OUTCOMES, STILL_OUTCOMES, CRM_FIELDS, suggestFor, type Outcome } from "../data";
import { Card, Muted, StatusSelect } from "./shared";

const MAX_LINES = 3;

// At most 3 lines of event badges; the rest folds into a "+N" badge whose tooltip lists them one per line.
// A hidden copy of every badge measures where lines break, so the cut follows the column width.
function EventChips({ events }: { events: string[] }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(events.length);

  useLayoutEffect(() => {
    const box = measureRef.current;
    if (!box) return;
    const compute = () => {
      const chips = Array.from(box.querySelectorAll<HTMLElement>("[data-chip]"));
      const plus = box.querySelector<HTMLElement>("[data-plus]");
      const tops = [...new Set(chips.map((c) => c.offsetTop))].sort((a, b) => a - b);
      if (tops.length <= MAX_LINES || !plus) { setVisible(events.length); return; }
      const lastTop = tops[MAX_LINES - 1];
      const gap = parseFloat(getComputedStyle(box).columnGap) || 0;
      let fit = chips.filter((c) => c.offsetTop < lastTop).length;
      // On the last line, keep a chip only if the "+N" badge still fits after it.
      for (const c of chips.filter((c) => c.offsetTop === lastTop)) {
        if (c.offsetLeft + c.offsetWidth + gap + plus.offsetWidth > box.clientWidth) break;
        fit++;
      }
      setVisible(fit);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(box);
    return () => ro.disconnect();
  }, [events]);

  const hidden = events.slice(visible);
  return (
    <div className="relative min-w-0">
      <div ref={measureRef} aria-hidden className="invisible absolute inset-x-0 top-0 flex flex-wrap gap-xs">
        {events.map((e) => <span key={e} data-chip><Badge type="neutral" size="sm">{e}</Badge></span>)}
        <span data-plus><Badge type="neutral" size="sm">+{events.length}</Badge></span>
      </div>
      <div className="flex flex-wrap gap-xs">
        {events.slice(0, visible).map((e) => <Badge key={e} type="neutral" size="sm">{e}</Badge>)}
        {hidden.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="cursor-default"><Badge type="neutral" size="sm">+{hidden.length}</Badge></span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <ul className="flex flex-col">{hidden.map((e) => <li key={e}>{e}</li>)}</ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function Head() {
  return (
    <div className="grid grid-cols-[200px_minmax(0,1fr)_200px] gap-lg border-b border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] px-lg py-sm text-sm leading-sm text-[var(--core-text-main-tertiary)]">
      <span className="flex items-center gap-xs"><Icon icon={faUserOutline} size="xs" />Lead status</span>
      <span className="flex items-center gap-xs"><Icon icon={faBoltOutline} size="xs" />Events it covers</span>
      <span className="flex items-center gap-xs"><Icon icon={faCircleSmallSolid} size="xs" />Contact status</span>
    </div>
  );
}

export function EventsCard() {
  const s = useCS();
  const [showStill, setShowStill] = useState(false);
  const cfg = s.draft;
  const disabled = !cfg.enabled;

  const autoMap = () => {
    const crm = CRM_FIELDS.find((f) => f.id === cfg.crmFieldId);
    s.setDraft((c) => ({ ...c, mapping: crm ? { ...c.mapping, ...crm.mapping } : suggestFor(c.statuses).mapping }));
    s.toast({ type: "success", title: "Events mapped", subtitle: "Every group got its closest status. Change any row you disagree with." });
  };

  const row = (o: Outcome, still: boolean) => (
    <div key={o.id} className={cn("grid grid-cols-[200px_minmax(0,1fr)_200px] items-center gap-lg border-b border-[var(--core-border-main-subtle)] px-lg py-md last:border-b-0", (disabled || still) && "bg-[var(--core-bg-main-primary)]")}>
      <div className="flex flex-col">
        <span className="text-base leading-base text-[var(--core-text-main-primary)]">{o.label}</span>
        {o.description && <Muted>{o.description}</Muted>}
      </div>
      <EventChips events={o.events} />
      {still ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block w-full"><Select size="md" value="No effect" disabled /></span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[260px]">{o.family === "team" ? "Describes what the team did in the campaign, not the contact." : "A technical failure: mapping it would overwrite a real status with noise."}</TooltipContent>
        </Tooltip>
      ) : (
        <div className="w-full min-w-0"><StatusSelect statuses={cfg.statuses} value={cfg.mapping[o.id] ?? null} disabled={disabled} onChange={(id) => s.setDraft((c) => ({ ...c, mapping: { ...c.mapping, [o.id]: id } }))} /></div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Card
        icon={faBoltOutline}
        title="Events"
        description="Choose which events update a contact's status."
        action={
          <div className="flex items-center gap-base">
            <Button appearance="outlined" intent="brand" size="md" leftIcon={faPlayOutline} onClick={() => s.setSimOpen(true)}>Try on a contact</Button>
            <Button appearance="outlined" intent="brand" size="md" leftIcon={faStarsOutline} disabled={disabled} onClick={autoMap}>Auto-map events</Button>
          </div>
        }
      >
        <div className={cn("flex flex-col gap-xl", disabled && "opacity-60")}>
          <div className="flex flex-col gap-base">
            <div className="flex items-baseline gap-base">
              <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">Moves a contact</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--core-border-main-primary)]">
              <Head />
              {MOVING_OUTCOMES.map((o) => row(o, false))}
            </div>
          </div>

          {/* Nobody edits these rows: folded by default so the page stays short. */}
          <div className="flex flex-col gap-base">
            <div>
              <Button appearance="ghost" intent="brand" size="sm" rightIcon={showStill ? faChevronUpOutline : faChevronDownOutline} onClick={() => setShowStill((v) => !v)}>
                {showStill ? "Hide" : "Show"} the {STILL_OUTCOMES.length} event groups that never move a contact
              </Button>
            </div>
            {showStill && (
              <>
                <InfoMessage type="info" description="These events are not lost: they all reach your CRM through the lemlist Lead status field, which carries the detail of every step." />
                <div className="overflow-hidden rounded-lg border border-[var(--core-border-main-primary)]">
                  <Head />
                  {STILL_OUTCOMES.map((o) => row(o, true))}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
