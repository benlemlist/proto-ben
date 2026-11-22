// Small shared parts of the PeopleDB lists proto.
import type { ReactNode } from "react";
import { Avatar, Badge, BadgeSpecific, cn } from "@l3mpire/ui";
import { SIGNALS, fa, fmt, relHours, type Lead, type SuggestedList } from "../data";

export const Muted = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("text-sm leading-sm text-[var(--core-text-main-tertiary)]", className)}>{children}</span>
);

/** Overlapping avatars + "+N" pill (lead previews on a card). */
export function AvatarStack({ leads, total }: { leads: Lead[]; total: number }) {
  const shown = leads.slice(0, 4);
  return (
    <div className="flex items-center">
      {shown.map((l, i) => (
        <span key={l.id} className={cn("rounded-full ring-2 ring-[var(--core-bg-main-primary)]", i > 0 && "-ml-sm")}>
          <Avatar size="md" src={l.photo} initials={`${l.firstName[0]}${l.lastName[0]}`} />
        </span>
      ))}
      {total > shown.length && (
        <span className="-ml-sm flex h-[24px] items-center rounded-full bg-[var(--core-bg-main-tertiary)] px-sm text-sm leading-sm font-medium text-[var(--core-text-main-secondary)] ring-2 ring-[var(--core-bg-main-primary)]">
          +{fmt(total - shown.length)}
        </span>
      )}
    </div>
  );
}

/** Top-left badge of a card: "Matches your ICP" or the color-coded signal type. */
export function ListBadge({ list }: { list: SuggestedList }) {
  if (list.section === "icp") return <Badge type="info" size="sm" icon={fa("bullseye-arrow")}>Matches your ICP</Badge>;
  const s = SIGNALS[list.signal!];
  return <Badge type={s.badge} size="sm" icon={s.icon}>{s.label}</Badge>;
}

/** Top-right meta of a card: ICP fit, or freshness (+ New). */
export function ListMeta({ list }: { list: SuggestedList }) {
  if (list.section === "icp") return <Muted>{list.fit}% ICP fit</Muted>;
  return (
    <span className="flex items-center gap-xs">
      {list.isNew && <BadgeSpecific type="new">New</BadgeSpecific>}
      <Muted>{relHours(list.hoursAgo ?? 0) === "Just now" ? "Today" : relHours(list.hoursAgo ?? 0)}</Muted>
    </span>
  );
}
