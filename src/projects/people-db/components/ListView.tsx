// "Open list": the pre-filtered PeopleDB view of one suggested list. Criteria are visible (RevOps can check the ICP fit)
// but not editable in V1. Leads can be selected and sent to a campaign.
import { useMemo, useState } from "react";
import {
  Button, Badge, Avatar, Checkbox, InfoMessage, BulkAction, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent, type BulkActionItem,
} from "@l3mpire/ui";
import { faArrowLeftOutline, faPlusOutline } from "@l3mpire/icons";
import { usePdb } from "../store";
import { fa, fmt, leadsFor, type SuggestedList } from "../data";
import { ListBadge, ListMeta, Muted } from "./shared";

export function ListView({ list }: { list: SuggestedList }) {
  const s = usePdb();
  const leads = useMemo(() => leadsFor(list, 40), [list]);
  const [selected, setSelected] = useState<string[]>([]);
  const allOn = selected.length === leads.length;

  const addToCampaign = (n: number) => {
    s.toast({ type: "success", title: `${fmt(n)} leads added to “${list.title}”`, subtitle: "New draft campaign created. Emails are found when the campaign launches." });
    setSelected([]);
  };

  const actions: BulkActionItem[] = [
    { id: "campaign", label: "Add to campaign", icon: faPlusOutline, appearance: "solid", intent: "brand", onClick: () => addToCampaign(selected.length) },
    { id: "contacts", label: "Save to contacts", icon: fa("address-book"), onClick: () => { s.toast({ type: "success", title: `${selected.length} leads saved to contacts` }); setSelected([]); } },
  ];

  return (
    <div className="relative flex min-h-full flex-col">
      <div className="flex flex-col gap-xl px-3xl pt-2xl pb-xl">
        <div>
          <Button appearance="ghost" intent="brand" size="sm" leftIcon={faArrowLeftOutline} onClick={() => s.openList(null)}>Suggested lists</Button>
        </div>
        <div className="flex items-start justify-between gap-2xl">
          <div className="flex min-w-0 flex-col gap-sm">
            <div className="flex items-center gap-base"><ListBadge list={list} /><ListMeta list={list} /></div>
            <span className="text-xxl leading-xl font-solid text-[var(--core-text-main-primary)]">{list.title}</span>
            <span className="text-base leading-base text-[var(--core-text-main-secondary)]">{fmt(list.leadCount)} leads · {list.description}</span>
          </div>
          <div className="flex shrink-0 items-center gap-base">
            <Button appearance="outlined" intent="brand" size="md" leftIcon={fa("download")}
              onClick={() => s.toast({ type: "info", title: "Export started", subtitle: `${fmt(list.leadCount)} leads, CSV sent by email.` })}>Export</Button>
            <Button appearance="solid" intent="brand" size="md" leftIcon={faPlusOutline} onClick={() => addToCampaign(list.leadCount)}>
              Add {fmt(list.leadCount)} leads to a campaign
            </Button>
          </div>
        </div>

        <InfoMessage type={list.section === "icp" ? "info" : "ai"} title="Why this list" description={list.why} />

        <div className="flex flex-wrap items-center gap-sm">
          <Muted className="mr-xs">Criteria</Muted>
          {list.criteria.map((c) => (
            <Badge key={c.label} type="neutral" size="md"><span className="text-[var(--core-text-main-tertiary)]">{c.label}:</span>&nbsp;{c.value}</Badge>
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button appearance="ghost" intent="brand" size="xs" leftIcon={fa("lock")} disabled>Edit criteria</Button></span>
              </TooltipTrigger>
              <TooltipContent>Editing a suggested list's criteria comes in a later version.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 px-3xl pb-4xl">
        <Table variant="borderless">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={allOn} onCheckedChange={(v) => setSelected(v ? leads.map((l) => l.id) : [])} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>{list.section === "icp" ? "Why they match" : "Signal"}</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Headcount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => {
              const on = selected.includes(l.id);
              return (
                <TableRow key={l.id} data-state={on ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={on} onCheckedChange={(v) => setSelected((xs) => (v ? [...xs, l.id] : xs.filter((x) => x !== l.id)))} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-base">
                      <Avatar size="md" src={l.photo} initials={`${l.firstName[0]}${l.lastName[0]}`} />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-base leading-base font-medium whitespace-nowrap text-[var(--core-text-main-primary)]">{l.firstName} {l.lastName}</span>
                        <Muted className="whitespace-nowrap">{l.title}</Muted>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-base">
                      <Avatar size="sm" shape="squared" initials={l.company.slice(0, 2).toUpperCase()} />
                      <div className="flex flex-col">
                        <span className="text-base leading-base whitespace-nowrap">{l.company}</span>
                        <Muted>{l.industry}</Muted>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-base leading-base whitespace-nowrap text-[var(--core-text-main-secondary)]">{l.reason}</span></TableCell>
                  <TableCell><span className="text-base leading-base whitespace-nowrap">{l.location}</span></TableCell>
                  <TableCell><span className="text-base leading-base whitespace-nowrap">{l.size}</span></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {list.leadCount > leads.length && (
          <div className="flex justify-center pt-xl"><Muted>Showing {leads.length} of {fmt(list.leadCount)} leads</Muted></div>
        )}
      </div>

      {selected.length > 0 && <BulkAction count={selected.length} onClear={() => setSelected([])} actions={actions} />}
    </div>
  );
}
