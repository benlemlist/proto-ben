// Left navigation (lot 3): views are pre-filters, the filter bar is the 2nd layer.
// Counts on every active view, none on Done (Maxime's rule).
import { SidebarSection, SidebarHeadingItem, SidebarItem, Avatar, getAvatarTone } from "@l3mpire/ui";
import {
  faInboxOutline, faInboxSolid, faStarsOutline, faStarsSolid, faEyeOutline, faEyeSolid, faStarOutline, faStarSolid,
  faClockOutline, faClockSolid, faCircleCheckOutline, faCircleCheckSolid, faPaperPlaneTopOutline, faPaperPlaneTopSolid,
  faUsersOutline, faUsersSolid, faTagOutline, faTagSolid, faUserOutline, faUserSolid,
} from "@l3mpire/icons";
import { useInbox } from "../store";
import { canSee, isUnread, matchScope, type Scope, type ViewId } from "../logic";
import { CHANNEL_META } from "./meta";
import { team, labels } from "../data";
import type { Channel } from "../types";

export function InboxNav() {
  const s = useInbox();
  const visible = s.convs.filter((c) => canSee(c, s.ctx));
  // Badge = unread conversations in the view (what needs you), like a mail client.
  const count = (scope: Partial<Scope>) => {
    const full: Scope = { view: "inbox", channel: null, teammate: null, label: null, ...scope };
    return visible.filter((c) => matchScope(c, full, s.ctx) && isUnread(c, s.ctx, full.teammate ?? s.ctx.me)).length;
  };
  const isActive = (scope: Partial<Scope>) =>
    s.scope.view === (scope.view ?? s.scope.view) && s.scope.channel === (scope.channel ?? null) && s.scope.teammate === (scope.teammate ?? null) && s.scope.label === (scope.label ?? null);
  const go = (scope: Partial<Scope>) => { s.setScope({ view: "inbox", channel: null, teammate: null, label: null, ...scope }); s.setChecked([]); };

  const item = (view: ViewId, label: string, icon: string, solidIcon: string, opts: { noCount?: boolean; isNew?: boolean } = {}) => {
    const n = count({ view });
    return (
      <SidebarItem key={view} icon={icon} solidIcon={solidIcon} label={label} isNew={opts.isNew}
        hasBadge={!opts.noCount && n > 0} badgeCount={String(n)}
        state={isActive({ view }) ? "active" : "default"} onClick={() => go({ view })} />
    );
  };

  const channels: Channel[] = ["email", "linkedin", "whatsapp", "sms", "call"];
  const others = team.filter((t) => t.id !== s.me);

  return (
    <nav className="flex h-full w-[216px] shrink-0 flex-col gap-base overflow-y-auto border-r border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] p-base">
      <div className="px-base pt-xs pb-xs text-lg leading-md font-semibold text-[var(--core-text-main-primary)]">Inbox</div>
      <SidebarSection>
        {item("inbox", "Inbox", faInboxOutline, faInboxSolid)}
        {s.has("ai_suggest") && item("to_classify", "To classify", faStarsOutline, faStarsSolid)}
        {item("unread", "Unread", faEyeOutline, faEyeSolid)}
        {item("favorites", "Favorites", faStarOutline, faStarSolid)}
      </SidebarSection>
      <SidebarSection>
        <SidebarHeadingItem label="Status" />
        {item("waiting", "Waiting for reply", faPaperPlaneTopOutline, faPaperPlaneTopSolid)}
        {item("snoozed", "Snoozed", faClockOutline, faClockSolid)}
        {item("done", "Done", faCircleCheckOutline, faCircleCheckSolid, { noCount: true })}
      </SidebarSection>
      {s.has("all_messages") && (
        <SidebarSection>
          <SidebarHeadingItem label="All messages" />
          {item("unknown", "Not a contact yet", faUserOutline, faUserSolid, { isNew: true })}
        </SidebarSection>
      )}
      <SidebarSection>
        <SidebarHeadingItem label="Channels" />
        {channels.map((ch) => {
          const n = count({ channel: ch });
          if (!n && ch !== "email" && ch !== "linkedin") return null;
          return (
            <SidebarItem key={ch} icon={CHANNEL_META[ch].icon} label={CHANNEL_META[ch].label} hasBadge={n > 0} badgeCount={String(n)}
              state={isActive({ channel: ch }) ? "active" : "default"} onClick={() => go({ channel: ch })} />
          );
        })}
      </SidebarSection>
      <SidebarSection>
        <SidebarHeadingItem label="Team" />
        <SidebarItem icon={faUsersOutline} solidIcon={faUsersSolid} label="All team"
          state={isActive({ view: "team" }) ? "active" : "default"} onClick={() => go({ view: "team" })} />
        {others.map((t) => {
          const n = count({ teammate: t.id });
          return (
            <SidebarItem key={t.id} avatar={<Avatar size="sm" initials={t.initials} tone={getAvatarTone(t.id)} />} label={t.name}
              hasBadge={n > 0} badgeCount={String(n)} state={isActive({ teammate: t.id }) ? "active" : "default"} onClick={() => go({ teammate: t.id })} />
          );
        })}
      </SidebarSection>
      <SidebarSection>
        <SidebarHeadingItem label="Views" />
        {labels.slice(0, 3).map((l) => (
          <SidebarItem key={l.id} icon={faTagOutline} solidIcon={faTagSolid} label={l.name} hasBadge={count({ label: l.id }) > 0} badgeCount={String(count({ label: l.id }))}
            state={isActive({ label: l.id }) ? "active" : "default"} onClick={() => go({ label: l.id })} />
        ))}
      </SidebarSection>
    </nav>
  );
}
