import { Avatar, Badge, StatusPill, getAvatarTone, cn } from "@l3mpire/ui";
import { Icon, faStarsOutline } from "@l3mpire/icons";
import { CHANNEL_META, INTEREST_META } from "./meta";
import type { Channel, Interest, Person } from "../types";


export function ChannelIcon({ channel, size = "xs", className }: { channel: Channel; size?: "xxs" | "xs" | "sm" | "md"; className?: string }) {
  const m = CHANNEL_META[channel];
  return <Icon icon={m.icon} size={size} label={m.label} className={className} style={{ color: m.color }} />;
}

const initialsOf = (name: string) => name.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

export function PersonAvatar({ person, size = "md", channel }: { person: Person; size?: "sm" | "md" | "lg" | "xl"; channel?: Channel }) {
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar size={size} initials={initialsOf(person.name)} tone={getAvatarTone(person.email ?? person.name)} />
      {channel && (
        <span className="absolute -bottom-xs -right-xs inline-flex items-center justify-center rounded-full bg-[var(--core-bg-main-primary)] shadow-sm">
          <ChannelIcon channel={channel} size="xxs" />
        </span>
      )}
    </span>
  );
}


export function InterestPill({ interest, size = "sm" }: { interest: Interest; size?: "sm" | "md" }) {
  const m = INTEREST_META[interest];
  return <StatusPill type={m.pill} size={size} icon={m.icon}>{m.label}</StatusPill>;
}

export function AiSuggestionBadge({ interest, confidence }: { interest: Interest; confidence: number }) {
  return (
    <Badge type="ai" size="sm" icon={faStarsOutline}>
      {INTEREST_META[interest].label}? {Math.round(confidence * 100)}%
    </Badge>
  );
}



/** Plain helper for text that uses the DS tokens. */
export function Muted({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-sm leading-sm text-[var(--core-text-main-tertiary)]", className)}>{children}</span>;
}

