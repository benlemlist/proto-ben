// Inbox Q1 2027 — data model of the proto.
// Mirrors production where it can (lemapp/imports/lemlist/inbox: one Inbox row per
// contact × sender, Activities as the source of truth) and adds what the vision needs:
// every message logged (campaign, manual, external), people who are not contacts yet,
// a conversation-level workflow status, team-level read state and privacy.

export type Channel = "email" | "linkedin" | "whatsapp" | "sms" | "call";

/** Where a message comes from. "external" = logged from the mailbox / LinkedIn, sent outside lemlist. */
export type MessageSource = "campaign" | "manual" | "external";

export type Direction = "in" | "out";

/**
 * Workflow status, driven by actions only (Maxime's exploration, kept):
 * open = needs you · pending = you replied, waiting · snoozed · done (closed).
 * A new inbound message always brings the conversation back to "open".
 */
export type ConvStatus = "open" | "pending" | "snoozed" | "done";

/** Lead interest, the contact status lemlist uses in campaigns and reports. */
export type Interest = "interested" | "not_interested" | "neutral";

export interface Teammate {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

export interface Person {
  /** Contact id when the person is a lemlist contact, null when not a contact yet. */
  contactId: string | null;
  name: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  jobTitle?: string;
  companyName?: string;
  companyDomain?: string;
}

export interface Attachment {
  name: string;
  kind: "pdf" | "csv" | "xlsx" | "image" | "doc" | "video";
  size: string;
}

export interface Message {
  id: string;
  convId: string;
  channel: Channel;
  direction: Direction;
  source: MessageSource;
  /** Email thread / LinkedIn conversation id. Several threads can live in one conversation. */
  threadId: string;
  /** Teammate who sent it (out) or whose mailbox / account received it (in). */
  userId: string;
  from: Person;
  to: Person[];
  cc: Person[];
  subject?: string;
  body: string;
  sentAt: string; // ISO
  campaignId?: string;
  stepName?: string;
  attachments?: Attachment[];
  /** Auto-reply (out of office), detected by AI. */
  autoReply?: { kind: "ooo"; backOn?: string };
  /** Forwarded by the contact to someone else (shown as an internal event, not a reply). */
  forwarded?: boolean;
  /** LinkedIn: invitation note, call: duration in seconds, outcome. */
  meta?: { kind: "linkedin_invite" | "linkedin_invite_accepted" | "call"; duration?: number; outcome?: string; recordingSummary?: string };
  /** Scheduled message not sent yet. */
  scheduledFor?: string;
}

export interface AiSuggestion {
  interest: Interest;
  /** 0..1 */
  confidence: number;
  reason: string;
}

export interface Note {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  /** Primary person of the conversation (merge at the contact level, every channel). */
  person: Person;
  /** Other people seen in the conversation (CC, colleague the contact forwarded to, other address). */
  participants: Person[];
  /** Teammate who owns the conversation (the sender). */
  ownerId: string;
  status: ConvStatus;
  snoozeUntil?: string;
  /** Team-level read state: who has read the latest message. */
  readBy: string[];
  /** Favorite, per user. */
  favoriteBy: string[];
  /** Private LinkedIn / WhatsApp conversation: only the owner sees it. */
  private: boolean;
  interest: Interest | null;
  /** Who set the interest: the user, or AI after the user confirmed. */
  interestSetBy?: "user" | "ai";
  ai?: AiSuggestion;
  labels: string[];
  campaignIds: string[];
  notes: Note[];
  draft?: Draft;
  /** Unknown sender: "not a contact yet" list until added, ignored or "never log". */
  unknown?: { state: "pending" | "ignored" };
  createdAt: string;
}

export interface Draft {
  channel: Channel;
  to: Person[];
  cc: Person[];
  bcc: Person[];
  subject?: string;
  body: string;
  savedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  emoji: string;
}

export interface Label {
  id: string;
  name: string;
  color: "indigo" | "orange" | "teal" | "pink" | "amber" | "violet" | "sky";
}
