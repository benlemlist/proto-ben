// Pure logic of the Inbox proto: what is visible, unread, how the list is sorted and filtered.
// Every rule that changes between production and a lot reads `has(feature)`, so the same
// screen shows "prod today" (lot 0) or any delivery lot.

import type { Channel, Conversation, Interest, Message } from "./types";
import { FEATURE_LOT, type Feature } from "./lots";

export type ViewId =
  // Lot 3+ navigation
  | "inbox" | "to_classify" | "unread" | "favorites" | "waiting" | "snoozed" | "done" | "unknown" | "team"
  // Production views (dropdown, lot 0–2)
  | "mine" | "archived" | "sent" | "untracked";

export interface Filters {
  campaignId?: string;
  interest?: Interest | "none";
  unreplied?: boolean;
  senderId?: string;
  channel?: Channel;
}

export interface Scope {
  view: ViewId;
  channel: Channel | null;
  teammate: string | null;
  label: string | null;
}

export interface Ctx {
  me: string;
  lot: number;
  msgsByConv: Map<string, Message[]>;
}

export const hasFeature = (lot: number, f: Feature) => lot >= FEATURE_LOT[f];

export function indexMessages(msgs: Message[]): Map<string, Message[]> {
  const map = new Map<string, Message[]>();
  for (const m of msgs) {
    if (!map.has(m.convId)) map.set(m.convId, []);
    map.get(m.convId)!.push(m);
  }
  for (const list of map.values()) list.sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  return map;
}

/** Messages shown for a conversation, given the lot (external messages need lot 4, except in Untracked). */
export function visibleMessages(conv: Conversation, ctx: Ctx, opts: { untrackedView?: boolean } = {}): Message[] {
  const all = ctx.msgsByConv.get(conv.id) ?? [];
  const now = new Date().toISOString();
  return all.filter((m) => {
    if (m.scheduledFor && m.scheduledFor > now && !hasFeature(ctx.lot, "schedule")) return false;
    if (m.source === "external" && !hasFeature(ctx.lot, "all_messages") && !opts.untrackedView) return false;
    if (m.meta?.kind?.startsWith("linkedin_invite") && !hasFeature(ctx.lot, "linkedin_events")) return false;
    return true;
  });
}

const isSent = (m: Message) => !m.scheduledFor || m.scheduledFor <= new Date().toISOString();

/** True when every message is external: production lists it in "Untracked" only. */
export const isUntrackedOnly = (conv: Conversation, ctx: Ctx) =>
  (ctx.msgsByConv.get(conv.id) ?? []).every((m) => m.source === "external");

/** Message shown as the list preview. Prod: last reply first, even after we answered. Lot 1: the latest message. */
export function previewMessage(conv: Conversation, ctx: Ctx): Message | undefined {
  const msgs = visibleMessages(conv, ctx, { untrackedView: true }).filter(isSent);
  if (hasFeature(ctx.lot, "preview_latest")) return msgs[msgs.length - 1];
  const replies = msgs.filter((m) => m.direction === "in" && !m.autoReply);
  return replies[replies.length - 1] ?? msgs[msgs.length - 1];
}

/** Sort key. Prod: lastRepliedAt (OOO ignored), then lastSentAt. Lot 1: any latest message. */
export function sortTime(conv: Conversation, ctx: Ctx): string {
  const msgs = visibleMessages(conv, ctx, { untrackedView: true }).filter(isSent);
  if (hasFeature(ctx.lot, "bubble_on_reply")) return msgs[msgs.length - 1]?.sentAt ?? conv.createdAt;
  const replies = msgs.filter((m) => m.direction === "in" && !m.autoReply);
  return replies[replies.length - 1]?.sentAt ?? msgs[msgs.length - 1]?.sentAt ?? conv.createdAt;
}

export const lastInbound = (conv: Conversation, ctx: Ctx) => {
  const msgs = visibleMessages(conv, ctx, { untrackedView: true }).filter((m) => m.direction === "in");
  return msgs[msgs.length - 1];
};

export const isUnread = (conv: Conversation, ctx: Ctx, userId = ctx.me) => {
  const last = lastInbound(conv, ctx);
  return !!last && !conv.readBy.includes(userId);
};

/** Who on the team has not read the latest reply (lot 5, team unread). */
export const unreadByOwner = (conv: Conversation, ctx: Ctx) =>
  conv.ownerId !== ctx.me && isUnread(conv, ctx, conv.ownerId);

export const channelsOf = (conv: Conversation, ctx: Ctx): Channel[] => {
  const set = new Set<Channel>();
  for (const m of visibleMessages(conv, ctx, { untrackedView: true })) set.add(m.channel);
  return [...set];
};

export const currentOoo = (conv: Conversation, ctx: Ctx) => {
  const msgs = visibleMessages(conv, ctx);
  const last = [...msgs].reverse().find((m) => m.direction === "in");
  return last?.autoReply?.kind === "ooo" ? last.autoReply : undefined;
};

/** Can the signed-in user see this conversation at all? */
export function canSee(conv: Conversation, ctx: Ctx): boolean {
  if (conv.private && conv.ownerId !== ctx.me && hasFeature(ctx.lot, "privacy_hotfix")) return false;
  if (conv.unknown) {
    if (!hasFeature(ctx.lot, "all_messages")) return false;
    if (conv.ownerId !== ctx.me) return false; // "Not a contact yet" is private
    if (conv.unknown.state === "ignored") return false;
  }
  return true;
}

const active = (c: Conversation) => c.status !== "done";

export function matchScope(conv: Conversation, scope: Scope, ctx: Ctx): boolean {
  const lot3 = hasFeature(ctx.lot, "status_workflow");
  const mine = conv.ownerId === ctx.me;
  const untracked = isUntrackedOnly(conv, ctx);

  // Before lot 4, conversations with only external messages live in "Untracked".
  if (!hasFeature(ctx.lot, "all_messages")) {
    if (scope.view === "untracked") return untracked && mine;
    if (untracked) return false;
  }
  if (scope.teammate) return conv.ownerId === scope.teammate && active(conv) && !conv.unknown;
  if (scope.label) return conv.labels.includes(scope.label) && active(conv);
  if (scope.channel) return mine && active(conv) && channelsOf(conv, ctx).includes(scope.channel);

  switch (scope.view) {
    case "inbox": return mine && conv.status === "open" && !conv.unknown;
    case "to_classify": return mine && conv.status === "open" && !conv.unknown && !conv.interest && !!lastInbound(conv, ctx);
    case "unread": return mine && isUnread(conv, ctx) && (lot3 ? conv.status !== "done" : true);
    case "favorites": return conv.favoriteBy.includes(ctx.me);
    case "waiting": return mine && conv.status === "pending";
    case "snoozed": return mine && conv.status === "snoozed";
    case "done":
    case "archived": return mine && conv.status === "done";
    case "unknown": return !!conv.unknown && conv.unknown.state === "pending";
    case "team": return active(conv) && !conv.unknown;
    case "mine": return mine && active(conv) && conv.status !== "snoozed";
    case "sent": {
      const msgs = visibleMessages(conv, ctx);
      return mine && active(conv) && !msgs.some((m) => m.direction === "in");
    }
    case "untracked": return false;
  }
}

export function matchFilters(conv: Conversation, f: Filters, ctx: Ctx): boolean {
  if (f.campaignId && !conv.campaignIds.includes(f.campaignId)) return false;
  if (f.senderId && conv.ownerId !== f.senderId) return false;
  if (f.channel && !channelsOf(conv, ctx).includes(f.channel)) return false;
  if (f.interest) {
    if (f.interest === "none" ? conv.interest : conv.interest !== f.interest) return false;
  }
  if (f.unreplied) {
    const msgs = visibleMessages(conv, ctx).filter((m) => !m.autoReply);
    if (msgs[msgs.length - 1]?.direction !== "in") return false;
  }
  return true;
}

export function matchSearch(conv: Conversation, q: string, ctx: Ctx): boolean {
  if (!q.trim()) return true;
  const needle = q.toLowerCase();
  const hay = [conv.person.name, conv.person.companyName, conv.person.email, ...visibleMessages(conv, ctx).map((m) => `${m.subject ?? ""} ${m.body}`)].join(" ").toLowerCase();
  return hay.includes(needle);
}

// ─── Mock AI (fallback when Live AI is off or no key) ──────────────────────────
export function mockClassify(body: string): { interest: Interest; confidence: number; reason: string } {
  const t = body.toLowerCase();
  if (/(remove me|unsubscribe|stop emailing|not interested|pas intéressé|désinscri|nicht interessiert)/.test(t))
    return { interest: "not_interested", confidence: 0.95, reason: "Asks to stop or says not interested." };
  if (/(not a priority|pas pour le moment|later|plus tard|q[1-4]|next year|in (january|february|march|april|may|june|september))/.test(t))
    return { interest: "neutral", confidence: 0.62, reason: "Not now, asks to come back later." };
  if (/(demo|call|meeting|rendez-vous|appel|créneau|price|pricing|tarif|quote|devis|let's talk|works for|passt|termin|donnerstag|dienstag|uhr)/.test(t))
    return { interest: "interested", confidence: 0.9, reason: "Asks for a meeting, a demo or pricing." };
  if (/(not the right person|pas mon périmètre|talk to|voyez plutôt|colleague)/.test(t))
    return { interest: "neutral", confidence: 0.7, reason: "Refers to someone else." };
  return { interest: "interested", confidence: 0.55, reason: "Positive tone, no clear next step." };
}

export const AI_AUTO_APPLY = 0.9;

export const relTime = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 0) {
    return d.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 1) return "now";
  if (diff < 60) return `${Math.round(diff)} min`;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
