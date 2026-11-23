// Statuses card. Feature off (every team today): a plain list of contact statuses, as in prod's
// "Manage your contact statuses" modal. Feature on: the lifecycle (Figma Layout 2), path (ordered,
// cold → hot), exits, and the statuses kept out of it (PM note 27/10). The feature switch itself
// lives above this card (FeatureSwitch), the rules below it (Events card).
import { useState, type DragEvent } from "react";
import {
  Button, StatusPill, Badge, Dialog, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuList, DropdownMenuRadixItem, DropdownMenuDelimiter, cn,
} from "@l3mpire/ui";
import {
  Icon, faGripDotsVerticalOutline, faPenOutline, faTrashOutline, faPlusOutline, faEllipsisOutline, faArrowRightOutline,
  faLockOutline, faUsersOutline,
} from "@l3mpire/icons";
import { useCS } from "../store";
import { CRM_FIELDS, OUTCOMES, type Column, type ContactStatus, type Config } from "../data";
import { Card, Muted } from "./shared";
import { StatusModal } from "./StatusModal";
import { SyncCrmModal } from "./SyncCrmModal";

const COLUMN_LABEL: Record<Column, string> = { path: "Lifecycle path", exit: "Exits", unused: "Not in the lifecycle" };

function move(cfg: Config, id: string, column: Column, beforeId: string | null): Config {
  const st = cfg.statuses.find((s) => s.id === id)!;
  const rest = cfg.statuses.filter((s) => s.id !== id);
  const moved = { ...st, column };
  const idx = beforeId ? rest.findIndex((s) => s.id === beforeId) : -1;
  if (idx >= 0) rest.splice(idx, 0, moved);
  else {
    // append after the last status of that column
    let last = -1;
    rest.forEach((s, i) => { if (s.column === column) last = i; });
    rest.splice(last + 1, 0, moved);
  }
  // A status out of the lifecycle can't be an event target any more.
  const mapping = column === "unused" ? Object.fromEntries(Object.entries(cfg.mapping).map(([k, v]) => [k, v === id ? null : v])) : cfg.mapping;
  return { ...cfg, statuses: rest, mapping };
}

// Plain list (feature off): reorder without touching a status' column.
function reorder(cfg: Config, id: string, beforeId: string | null): Config {
  const st = cfg.statuses.find((s) => s.id === id)!;
  const rest = cfg.statuses.filter((s) => s.id !== id);
  const idx = beforeId ? rest.findIndex((s) => s.id === beforeId) : -1;
  if (idx >= 0) rest.splice(idx, 0, st);
  else rest.push(st);
  return { ...cfg, statuses: rest };
}

export function LifecycleCard() {
  const s = useCS();
  const cfg = s.draft;
  const crm = CRM_FIELDS.find((f) => f.id === cfg.crmFieldId) ?? null;
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<{ column: Column; beforeId: string | null } | null>(null);
  const [modal, setModal] = useState<{ column: Column; status: ContactStatus | null } | null>(null);
  const [toDelete, setToDelete] = useState<ContactStatus | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const simple = !cfg.enabled;

  const mappedCount = (id: string) => Object.values(cfg.mapping).filter((v) => v === id).length;
  // The event groups that move a contact to this status (Events card, same order).
  const triggers = (id: string) => OUTCOMES.filter((o) => cfg.mapping[o.id] === id);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const before = over?.beforeId === dragId ? null : over?.beforeId ?? null;
    if (dragId && over) s.setDraft((c) => (simple ? reorder(c, dragId, before) : move(c, dragId, over.column, before)));
    setDragId(null); setOver(null);
  };

  const row = (st: ContactStatus, i: number) => {
    const isOver = over?.beforeId === st.id && dragId !== st.id;
    return (
      <div
        key={st.id}
        draggable
        onDragStart={(e) => { setDragId(st.id); e.dataTransfer.effectAllowed = "move"; }}
        onDragEnd={() => { setDragId(null); setOver(null); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver({ column: st.column, beforeId: st.id }); }}
        onDrop={onDrop}
        className={cn(
          "group relative flex h-[40px] items-center gap-base rounded-base border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] pr-xs pl-sm",
          dragId === st.id && "opacity-40",
        )}
      >
        {isOver && <span className="absolute -top-[5px] right-0 left-0 h-[2px] rounded-full bg-[var(--core-border-main-selected)]" />}
        <span className="cursor-grab text-[var(--core-text-main-tertiary)]"><Icon icon={faGripDotsVerticalOutline} size="xs" /></span>
        {!simple && st.column === "path" && <span className="w-[12px] text-sm leading-sm text-[var(--core-text-main-tertiary)]">{i + 1}</span>}
        <StatusPill type={st.color} size="sm">{st.name}</StatusPill>
        <span className="flex-1" />
        {!simple && st.column !== "unused" && (() => {
          const t = triggers(st.id);
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default"><Muted className={cn("whitespace-nowrap", t.length === 0 && "text-[var(--core-text-main-quaternary-icon-only)]")}>{t.length} mapped</Muted></span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px]">
                {t.length === 0 ? (
                  <span>No event moves contacts to {st.name}. Pick it for an event group in Events below.</span>
                ) : (
                  <div className="flex flex-col gap-sm">
                    <span>Moves contacts to {st.name}:</span>
                    {t.map((o) => (
                      <div key={o.id} className="flex flex-col">
                        <span className="font-medium">{o.label}</span>
                        <span className="opacity-70">{o.events.join(" · ")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })()}
        {crm && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex size-[24px] items-center justify-center text-[var(--core-text-main-tertiary)]"><Icon icon={faLockOutline} size="xs" /></span>
            </TooltipTrigger>
            <TooltipContent side="top">Comes from {crm.crm}. Rename or delete it in {crm.crm}.</TooltipContent>
          </Tooltip>
        )}
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faEllipsisOutline} aria-label="More" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-max min-w-[220px] max-w-[320px]">
            <DropdownMenuList>
              {!crm && <DropdownMenuRadixItem icon={faPenOutline} label="Edit" onSelect={() => setModal({ column: st.column, status: st })} />}
              {!simple && (["path", "exit", "unused"] as Column[]).filter((c) => c !== st.column).map((c) => (
                <DropdownMenuRadixItem key={c} icon={faArrowRightOutline} label={`Move to ${COLUMN_LABEL[c]}`} onSelect={() => s.setDraft((cf) => move(cf, st.id, c, null))} />
              ))}
              {!crm && (
                <>
                  <DropdownMenuDelimiter bleed />
                  {/* Same rule as prod (lemcrm-status-modal.tsx): a status in use can't be deleted. Prod's sentence doesn't fit a menu item. */}
                  <DropdownMenuRadixItem
                    icon={faTrashOutline} label="Delete" destructive disabled={(st.contacts ?? 0) > 0}
                    description={(st.contacts ?? 0) > 0 ? `Used by ${st.contacts!.toLocaleString("en-US")} contacts` : undefined}
                    onSelect={() => setToDelete(st)}
                  />
                </>
              )}
            </DropdownMenuList>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>
    );
  };

  const column = (col: Column, description: string) => {
    const list = cfg.statuses.filter((x) => x.column === col);
    const zoneOver = over?.column === col && over.beforeId === null;
    return (
      <div
        className={cn("flex min-h-[200px] flex-col rounded-lg border border-[var(--core-border-main-primary)]", zoneOver && dragId && "border-[var(--core-border-main-selected)]")}
        onDragOver={(e) => { e.preventDefault(); setOver({ column: col, beforeId: null }); }}
        onDrop={onDrop}
      >
        <div className="flex items-start gap-base border-b border-[var(--core-border-main-subtle)] px-xl py-lg">
          <div className="flex flex-1 flex-col">
            <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{COLUMN_LABEL[col]}</span>
            <Muted>{description}</Muted>
          </div>
          {!crm && <Button appearance="ghost" intent="brand" size="sm" leftIcon={faPlusOutline} onClick={() => setModal({ column: col, status: null })}>Add status</Button>}
        </div>
        <div className="flex flex-1 flex-col gap-sm p-xl">
          {list.map(row)}
          {list.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-base border border-dashed border-[var(--core-border-main-primary)] p-xl text-center">
              <Muted>Drag a status here</Muted>
            </div>
          )}
        </div>
      </div>
    );
  };

  const unused = cfg.statuses.filter((x) => x.column === "unused");

  return (
    <TooltipProvider>
      <Card
        icon={faUsersOutline}
        title={simple ? "Contact statuses" : "Contact lifecycle"}
        description={simple ? "Set by hand, by CSV, API or from your CRM." : "Drag each status where it belongs."}
        action={
          <div className="flex items-center gap-lg">
            {crm && <Badge type="neutral" size="md">Values from {crm.crm} · {crm.label}</Badge>}
            <Button appearance={crm ? "outlined" : "solid"} intent="brand" size="md" onClick={() => setSyncOpen(true)}>{crm ? "Change sync" : "Sync with CRM"}</Button>
          </div>
        }
      >
        {simple ? (
          // Same content as prod's status modal: ordered list, add, edit, delete.
          <div
            className="flex flex-col rounded-lg border border-[var(--core-border-main-primary)]"
            onDragOver={(e) => { e.preventDefault(); setOver({ column: "unused", beforeId: null }); }}
            onDrop={onDrop}
          >
            <div className="flex items-start gap-base border-b border-[var(--core-border-main-subtle)] px-xl py-lg">
              <div className="flex flex-1 flex-col">
                <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{cfg.statuses.length} statuses</span>
                <Muted>Drag to reorder. The order is the one your team sees in the status picker.</Muted>
              </div>
              {!crm && <Button appearance="ghost" intent="brand" size="sm" leftIcon={faPlusOutline} onClick={() => setModal({ column: "unused", status: null })}>Add status</Button>}
            </div>
            <div className="flex flex-col gap-sm p-xl">{cfg.statuses.map(row)}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-xl">
            <div className="grid grid-cols-2 gap-lg">
              {column("path", "Moves a contact forward, from top to bottom.")}
              {column("exit", "Contacts who drop out. They can come back at their next event.")}
            </div>

            {/* Same box as the two columns, without Add status: a status lands here by being dragged out. */}
            <div
              className={cn("flex flex-col rounded-lg border border-[var(--core-border-main-primary)]", over?.column === "unused" && dragId && "border-[var(--core-border-main-selected)]")}
              onDragOver={(e) => { e.preventDefault(); setOver({ column: "unused", beforeId: null }); }}
              onDrop={onDrop}
            >
              <div className="flex items-start gap-base border-b border-[var(--core-border-main-subtle)] px-xl py-lg">
                <div className="flex flex-1 flex-col">
                  <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{COLUMN_LABEL.unused}</span>
                  <Muted>Events never set these. Still available by hand, by CSV, API and from your CRM.</Muted>
                </div>
              </div>
              <div className="p-xl">
                {unused.length > 0 ? (
                  <div className="grid grid-cols-2 gap-sm">{unused.map(row)}</div>
                ) : (
                  <div className="flex items-center justify-center rounded-base border border-dashed border-[var(--core-border-main-primary)] p-xl text-center">
                    <Muted>Drag a status here to keep it out of the lifecycle</Muted>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <StatusModal
        open={!!modal}
        onOpenChange={(v) => !v && setModal(null)}
        initial={modal?.status}
        existing={cfg.statuses}
        onSubmit={({ name, color }) => {
          if (!modal) return;
          if (modal.status) s.setDraft((c) => ({ ...c, statuses: c.statuses.map((x) => (x.id === modal.status!.id ? { ...x, name, color } : x)) }));
          else s.setDraft((c) => ({ ...c, statuses: [...c.statuses, { id: `st_${Date.now().toString(36)}`, name, color, column: modal.column }] }));
        }}
      />

      <Dialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        intent="alert"
        title={`Delete “${toDelete?.name}”?`}
        description={toDelete ? `${mappedCount(toDelete.id) ? `${mappedCount(toDelete.id)} event group${mappedCount(toDelete.id) > 1 ? "s" : ""} will stop moving contacts. ` : ""}No contact has this status, so nothing else changes.` : ""}
        primaryLabel="Delete"
        cancelLabel="Cancel"
        onPrimaryAction={() => {
          const id = toDelete!.id;
          s.setDraft((c) => ({ ...c, statuses: c.statuses.filter((x) => x.id !== id), mapping: Object.fromEntries(Object.entries(c.mapping).map(([k, v]) => [k, v === id ? null : v])) }));
          setToDelete(null);
        }}
      />

      <SyncCrmModal open={syncOpen} onOpenChange={setSyncOpen} />
    </TooltipProvider>
  );
}
