// Activities tab: where each lemlist activity lands. Prod's dropdown, unchanged (Salesforce).
import { useState } from "react";
import { InfoMessage, Select, DropdownMenu, DropdownMenuList, DropdownMenuItem, Switch } from "@l3mpire/ui";
import { Icon, faArrowRightOutline } from "@l3mpire/icons";
import { ACTIVITY_GROUPS, DESTINATIONS, type Activity, type DestinationId } from "../data";

export function ActivitiesTab({ activities, onChange, onOpenMapping }: {
  activities: Activity[]; onChange: (id: string, patch: Partial<Activity>) => void; onOpenMapping: () => void;
}) {
  return (
    <div className="flex flex-col gap-xl">
      <InfoMessage
        type="info"
        description="Each activity lands on a Salesforce Task, Email message or Event. What goes inside (subject, campaign, type…) is set once per object in Field Mapping."
        linkLabel="Open Field Mapping"
        onLinkClick={onOpenMapping}
      />
      {ACTIVITY_GROUPS.map((g) => {
        const list = activities.filter((a) => a.group === g);
        return (
          <section key={g} className="flex flex-col rounded-lg border border-[var(--core-border-main-subtle)]">
            <header className="border-b border-[var(--core-border-main-subtle)] px-xl py-lg text-base leading-base font-medium text-[var(--core-text-main-primary)]">{g}</header>
            {list.map((a) => (
              <div key={a.id} className="grid grid-cols-[auto_1fr_20px_300px] items-center gap-lg border-t border-[var(--core-border-main-subtle)] px-xl py-sm first:border-t-0">
                <Switch checked={a.on} onCheckedChange={(on) => onChange(a.id, { on })} aria-label={a.label} />
                <span className="text-base leading-base text-[var(--core-text-main-primary)]">{a.label}</span>
                <Icon icon={faArrowRightOutline} size="xs" className="text-[var(--core-text-main-tertiary)]" />
                <DestinationSelect value={a.destination} disabled={!a.on} onChange={(destination) => onChange(a.id, { destination })} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function DestinationSelect({ value, disabled, onChange }: { value: DestinationId; disabled: boolean; onChange: (d: DestinationId) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Select size="md" value={DESTINATIONS.find((d) => d.id === value)?.label} isOpen={open} onOpenChange={setOpen} disabled={disabled}>
      <DropdownMenu className="w-[300px]">
        <DropdownMenuList>
          {DESTINATIONS.map((d) => <DropdownMenuItem key={d.id} label={d.label} selected={d.id === value} onClick={() => { onChange(d.id); setOpen(false); }} />)}
        </DropdownMenuList>
      </DropdownMenu>
    </Select>
  );
}
