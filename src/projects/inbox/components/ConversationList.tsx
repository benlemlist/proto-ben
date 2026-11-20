import { useState } from "react";
import {
  Button, Checkbox, SearchBar, TruncatedText, Badge, Avatar, getAvatarTone, EmptyState, BulkAction, cn,
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuList, DropdownMenuRadixItem, DropdownMenuDelimiter,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@l3mpire/ui";
import {
  Icon, faFilterOutline, faChevronDownOutline, faStarSolid, faStarOutline, faClockOutline, faCircleCheckOutline,
  faEyeOutline, faEyeSlashOutline, faPenToSquareOutline, faLockOutline, faXmarkOutline, faInboxOutline, faTagOutline,
} from "@l3mpire/icons";
import { useInbox } from "../store";
import {
  canSee, matchScope, previewMessage, sortTime, isUnread, channelsOf, currentOoo, relTime, dayLabel,
  unreadByOwner, type ViewId,
} from "../logic";
import { ChannelIcon, PersonAvatar, InterestPill, AiSuggestionBadge } from "./shared";
import { CHANNEL_META, INTEREST_META } from "./meta";
import { campaigns, labels, team, inDays } from "../data";
import { faPlaneOutline } from "../icons";
import type { Channel, Conversation, Interest } from "../types";


const PROD_VIEWS: { id: ViewId; label: string }[] = [
  { id: "mine", label: "My conversations" },
  { id: "unread", label: "Unread" },
  { id: "favorites", label: "Favorites" },
  { id: "snoozed", label: "Snoozed" },
  { id: "archived", label: "Archived" },
  { id: "sent", label: "Sent only" },
  { id: "untracked", label: "Untracked" },
];

const VIEW_TITLE: Partial<Record<ViewId, string>> = {
  inbox: "Inbox", to_classify: "To classify", unread: "Unread", favorites: "Favorites", waiting: "Waiting for reply",
  snoozed: "Snoozed", done: "Done", unknown: "Not a contact yet", team: "All team",
};


import { useListedConversations } from "../hooks";

export function ConversationList() {
  const s = useInbox();
  const list = useListedConversations();
  const [showFilters, setShowFilters] = useState(false);
  const leftNav = s.has("left_nav");

  const title = s.scope.teammate ? team.find((t) => t.id === s.scope.teammate)?.name
    : s.scope.channel ? CHANNEL_META[s.scope.channel].label
    : s.scope.label ? labels.find((l) => l.id === s.scope.label)?.name
    : VIEW_TITLE[s.scope.view] ?? PROD_VIEWS.find((v) => v.id === s.scope.view)?.label;

  const groups: { label: string; items: Conversation[] }[] = [];
  for (const c of list) {
    const label = dayLabel(sortTime(c, s.ctx));
    const g = groups[groups.length - 1];
    if (g?.label === label) g.items.push(c); else groups.push({ label, items: [c] });
  }

  const allChecked = list.length > 0 && list.every((c) => s.checked.includes(c.id));
  const activeFilterCount = Object.values(s.filters).filter(Boolean).length;

  return (
    <section className="flex h-full w-[360px] shrink-0 flex-col border-r border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]">
      <header className="flex flex-col gap-base border-b border-[var(--core-border-main-subtle)] px-lg py-base">
        <div className="flex items-center gap-base">
          {s.has("bulk") && (
            <Checkbox checked={allChecked} onCheckedChange={(v) => s.setChecked(v ? list.map((c) => c.id) : [])} aria-label="Select all" />
          )}
          {leftNav ? (
            <span className="flex-1 truncate text-md leading-md font-semibold text-[var(--core-text-main-primary)]">{title}</span>
          ) : (
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild>
                <Button appearance="ghost" intent="brand" size="sm" rightIcon={faChevronDownOutline}>{title}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px]">
                <DropdownMenuList>
                  {PROD_VIEWS.map((v) => {
                    const n = s.convs.filter((c) => canSee(c, s.ctx) && matchScope(c, { view: v.id, channel: null, teammate: null, label: null }, s.ctx)).length;
                    return <DropdownMenuRadixItem key={v.id} label={v.label} value={String(n)} selected={s.scope.view === v.id} onSelect={() => s.setScope({ view: v.id, channel: null, teammate: null, label: null })} />;
                  })}
                  <DropdownMenuDelimiter bleed />
                  {team.filter((t) => t.id !== s.me).slice(0, 3).map((t) => (
                    <DropdownMenuRadixItem key={t.id} label={t.name} sublabel="Teammate" avatar={<Avatar size="md" initials={t.initials} tone={getAvatarTone(t.id)} />}
                      onSelect={() => s.setScope({ view: "mine", channel: null, teammate: t.id, label: null })} />
                  ))}
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          )}
          <span className="flex-1" />
          <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{list.length}</span>
          {s.has("filters") && (
            <Button appearance={showFilters || activeFilterCount ? "outlined" : "ghost"} intent="brand" size="sm" leftIcon={faFilterOutline}
              badge={activeFilterCount || undefined} onClick={() => setShowFilters((v) => !v)}>Filter</Button>
          )}
        </div>
        <SearchBar size="sm" variant="grey" placeholder="Search name, company, message…" value={s.search} onChange={(e) => s.setSearch(e.target.value)} onClear={s.search ? () => s.setSearch("") : undefined} />
        {s.has("filters") && (showFilters || activeFilterCount > 0) && <FilterBar />}
      </header>

      <div className="relative flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <div className="p-2xl">
            <EmptyState icon={faInboxOutline} size="sm" title={s.scope.view === "inbox" ? "Inbox zero" : "No conversations found"}
              description={s.scope.view === "inbox" ? "New replies show up here. Done conversations come back when someone replies." : "Try another view or clear the filters."} />
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label}>
              <div className="sticky top-0 z-[1] bg-[var(--core-bg-main-primary)] px-lg pt-base pb-xs text-xs leading-xs font-medium uppercase tracking-wide text-[var(--core-text-main-tertiary)]">{g.label}</div>
              {g.items.map((c) => <Row key={c.id} conv={c} />)}
            </div>
          ))
        )}
      </div>

      {s.has("bulk") && s.checked.length > 0 && (
        <BulkAction count={s.checked.length} countLabel="selected" onClear={() => s.setChecked([])} position="static"
          actions={[
            { id: "interested", label: "Interested", onClick: () => { s.checked.forEach((id) => s.setInterest(id, "interested")); s.setChecked([]); } },
            { id: "done", label: "Done", appearance: "solid", onClick: () => { s.checked.forEach((id) => s.markDone(id)); s.setChecked([]); } },
            { id: "snooze", label: "Snooze 1 week", icon: faClockOutline, onClick: () => { s.checked.forEach((id) => s.snooze(id, inDays(7), "next week")); s.setChecked([]); } },
            { id: "read", label: "Mark as read", icon: faEyeOutline, onClick: () => { s.checked.forEach((id) => s.markRead(id, true)); s.setChecked([]); } },
            { id: "tag", label: "Tag Hot deal", icon: faTagOutline, onClick: () => { s.checked.forEach((id) => s.toggleLabel(id, "lbl_hot")); s.setChecked([]); } },
          ]} />
      )}
    </section>
  );
}

function FilterBar() {
  const s = useInbox();
  const f = s.filters;
  const set = (patch: Partial<typeof f>) => s.setFilters({ ...f, ...patch });
  const chip = (label: string, value: string | undefined, items: { id: string; label: string; icon?: string }[], onPick: (id: string | undefined) => void) => (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <Button appearance={value ? "outlined" : "ghost"} intent="brand" size="xs" rightIcon={faChevronDownOutline}>
          {value ? `${label}: ${items.find((i) => i.id === value)?.label}` : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuList>
          {items.map((i) => <DropdownMenuRadixItem key={i.id} label={i.label} icon={i.icon} selected={value === i.id} onSelect={() => onPick(value === i.id ? undefined : i.id)} />)}
        </DropdownMenuList>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
  return (
    <div className="flex flex-wrap items-center gap-xs">
      {chip("Sender", f.senderId, team.map((t) => ({ id: t.id, label: t.id === s.me ? `${t.name} (you)` : t.name })), (id) => set({ senderId: id }))}
      {chip("Campaign", f.campaignId, campaigns.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` })), (id) => set({ campaignId: id }))}
      {chip("Channel", f.channel, (Object.keys(CHANNEL_META) as Channel[]).map((ch) => ({ id: ch, label: CHANNEL_META[ch].label, icon: CHANNEL_META[ch].icon })), (id) => set({ channel: id as Channel | undefined }))}
      {chip("Interest", f.interest, [...(Object.keys(INTEREST_META) as Interest[]).map((i) => ({ id: i, label: INTEREST_META[i].label })), { id: "none", label: "Not set" }], (id) => set({ interest: id as Interest | "none" | undefined }))}
      <Button appearance={f.unreplied ? "outlined" : "ghost"} intent="brand" size="xs" onClick={() => set({ unreplied: !f.unreplied || undefined })}>Unreplied</Button>
      {Object.values(f).some(Boolean) && <Button appearance="ghost" intent="brand" size="xs" leftIcon={faXmarkOutline} onClick={() => s.setFilters({})}>Clear</Button>}
    </div>
  );
}

function Row({ conv }: { conv: Conversation }) {
  const s = useInbox();
  const preview = previewMessage(conv, s.ctx);
  const unread = isUnread(conv, s.ctx);
  const selected = s.selectedId === conv.id;
  const fav = conv.favoriteBy.includes(s.me);
  const favByOther = !fav && conv.favoriteBy.length > 0;
  const chans = channelsOf(conv, s.ctx);
  const ooo = s.has("ooo_visible") ? currentOoo(conv, s.ctx) : undefined;
  const owner = team.find((t) => t.id === conv.ownerId)!;
  const checked = s.checked.includes(conv.id);
  const showAi = s.has("ai_suggest") && !conv.interest && conv.ai && !!preview && preview.direction === "in";

  const previewText = preview
    ? `${preview.direction === "out" && s.has("preview_latest") ? "You: " : ""}${preview.meta?.kind === "call" ? `Call · ${Math.round((preview.meta.duration ?? 0) / 60)} min` : preview.meta?.kind === "linkedin_invite_accepted" ? "Accepted your invitation" : preview.body}`
    : "";
  const lead = preview?.channel ?? chans[0] ?? "email";

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => s.select(conv.id)}
      onKeyDown={(e) => { if (e.key === "Enter") s.select(conv.id); }}
      className={cn(
        "group relative flex cursor-pointer gap-md border-b border-[var(--core-border-main-subtle)] px-lg py-md outline-none",
        selected ? "bg-[var(--core-bg-main-tertiary)]" : "hover:bg-[var(--core-bg-main-hover)]",
      )}
    >
      {unread && <span className="absolute left-xs top-1/2 h-base w-base -translate-y-1/2 rounded-full bg-[var(--core-text-functional-info)]" aria-label="Unread" />}
      <div className="pt-2xs" onClick={(e) => { if (s.has("bulk")) e.stopPropagation(); }}>
        {s.has("bulk") && (checked || s.checked.length > 0) ? (
          <span className="inline-flex h-8 w-8 items-center justify-center">
            <Checkbox checked={checked} onCheckedChange={(v) => s.setChecked(v ? [...s.checked, conv.id] : s.checked.filter((x) => x !== conv.id))} />
          </span>
        ) : (
          <span className="relative">
            <PersonAvatar person={conv.person} channel={s.has("channel_icon") ? lead : undefined} />
            {s.has("bulk") && (
              <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-[var(--core-bg-main-primary)] group-hover:flex">
                <Checkbox checked={false} onCheckedChange={() => s.setChecked([...s.checked, conv.id])} />
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2xs">
        <div className="flex items-center gap-xs">
          <TruncatedText className={cn("max-w-[170px] text-base leading-base", unread ? "font-semibold text-[var(--core-text-main-primary)]" : "font-medium text-[var(--core-text-main-primary)]")}>{conv.person.name}</TruncatedText>
          {conv.private && s.has("private") && <Icon icon={faLockOutline} size="xxs" label="Private conversation" className="text-[var(--core-text-main-tertiary)]" />}
          {(fav || favByOther) && <Icon icon={faStarSolid} size="xxs" label={favByOther ? "Favorited by a teammate" : "Favorite"} className={favByOther ? "text-[var(--core-text-main-tertiary)]" : "text-[var(--core-bg-specific-favorite-active)]"} />}
          {conv.draft && s.has("draft_label") && <Icon icon={faPenToSquareOutline} size="xxs" label="Draft" className="text-[var(--core-text-functional-critical)]" />}
          <span className="flex-1" />
          {s.has("channel_icon") && chans.length > 1 && (
            <span className="flex items-center gap-2xs opacity-80">{chans.slice(0, 3).map((ch) => <ChannelIcon key={ch} channel={ch} size="xxs" />)}</span>
          )}
          <span className={cn("shrink-0 text-sm leading-sm", unread ? "font-medium text-[var(--core-text-main-primary)]" : "text-[var(--core-text-main-tertiary)]")}>{relTime(sortTime(conv, s.ctx))}</span>
        </div>
        <div className="flex items-center gap-xs text-sm leading-sm text-[var(--core-text-main-secondary)]">
          <TruncatedText className="max-w-[200px]">{[conv.person.jobTitle, conv.person.companyName].filter(Boolean).join(" · ")}</TruncatedText>
        </div>
        <p className={cn("line-clamp-2 text-sm leading-sm", unread ? "text-[var(--core-text-main-primary)]" : "text-[var(--core-text-main-tertiary)]")}>
          {preview?.subject && preview.channel === "email" && <span className="font-medium">{preview.subject} · </span>}
          {previewText}
        </p>
        <div className="flex flex-wrap items-center gap-xs empty:hidden">
          {conv.unknown && <Badge type="warning" size="sm">Not a contact yet</Badge>}
          {ooo && <Badge type="neutral" size="sm" icon={faPlaneOutline}>Out of office{ooo.backOn ? ` · back ${new Date(ooo.backOn).toLocaleDateString("en-US", { weekday: "short" })}` : ""}</Badge>}
          {conv.status === "snoozed" && conv.snoozeUntil && !ooo && <Badge type="neutral" size="sm" icon={faClockOutline}>Until {new Date(conv.snoozeUntil).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</Badge>}
          {conv.interest && (s.has("interest_header") || conv.interest !== "neutral") && <InterestPill interest={conv.interest} />}
          {showAi && conv.ai && <AiSuggestionBadge interest={conv.ai.interest} confidence={conv.ai.confidence} />}
          {conv.labels.map((id) => { const l = labels.find((x) => x.id === id)!; return <Badge key={id} type={l.color} size="sm">{l.name}</Badge>; })}
          {conv.ownerId !== s.me && (
            <Badge type="neutral" size="sm" avatar={<Avatar size="sm" initials={owner.initials} tone={getAvatarTone(owner.id)} />}>
              {owner.firstName}{s.has("team_unread") && unreadByOwner(conv, s.ctx) ? " · unread" : ""}
            </Badge>
          )}
          {preview?.scheduledFor && <Badge type="info" size="sm" icon={faClockOutline}>Scheduled</Badge>}
        </div>
      </div>
      <RowActions conv={conv} unread={unread} fav={fav} />
    </div>
  );
}

function RowActions({ conv, unread, fav }: { conv: Conversation; unread: boolean; fav: boolean }) {
  const s = useInbox();
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  const done = conv.status === "done";
  const action = (label: string, icon: string, onClick: () => void) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={icon} aria-label={label} onClick={stop(onClick)} />
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
  return (
    <TooltipProvider>
      <div className="absolute right-lg top-md hidden items-center gap-2xs rounded-base border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] p-2xs shadow-sm group-hover:flex">
        {action(unread ? "Mark as read" : "Mark as unread", unread ? faEyeOutline : faEyeSlashOutline, () => s.markRead(conv.id, unread))}
        {action(fav ? "Unfavorite" : "Favorite", fav ? faStarSolid : faStarOutline, () => s.toggleFavorite(conv.id))}
        {conv.status !== "snoozed" && action("Snooze until tomorrow", faClockOutline, () => s.snooze(conv.id, inDays(1, 8), "tomorrow 8:00"))}
        {action(done ? (s.has("status_workflow") ? "Reopen" : "Restore") : s.has("status_workflow") ? "Done (E)" : "Archive", faCircleCheckOutline, () => (done ? s.reopen(conv.id) : s.markDone(conv.id)))}
      </div>
    </TooltipProvider>
  );
}
