// The conversation timeline: every channel of the contact, merged (one conversation = one contact).
import { useState } from "react";
import { Button, Badge, ObjectButton, cn, InfoMessage } from "@l3mpire/ui";
import { Icon, faChevronDownOutline, faChevronUpOutline, faFileOutline, faDownloadOutline, faUserOutline, faClockOutline, faStarsOutline } from "@l3mpire/icons";
import { useInbox } from "../store";
import { dayLabel, fmtDate } from "../logic";
import { ChannelIcon, PersonAvatar } from "./shared";
import { CHANNEL_META, sourceLabel } from "./meta";
import { campaigns, team } from "../data";
import { faReplyOutline, faReplyAllOutline, faForwardOutline, faPaperclipOutline, faPlaneOutline, faUserPlusOutline } from "../icons";
import type { Conversation, Message, Person } from "../types";

export type ReplyMode = "reply" | "replyAll" | "forward";

export function Timeline({ conv, msgs, onReply }: { conv: Conversation; msgs: Message[]; onReply: (m: Message, mode: ReplyMode) => void }) {
  const s = useInbox();
  const items: ({ kind: "day"; label: string } | { kind: "msg"; m: Message } | { kind: "note"; id: string; body: string; userId: string; at: string })[] = [];
  const notes = s.has("notes") ? conv.notes.map((n) => ({ kind: "note" as const, id: n.id, body: n.body, userId: n.userId, at: n.createdAt })) : [];
  const merged = [...msgs.map((m) => ({ at: m.sentAt, item: { kind: "msg" as const, m } })), ...notes.map((n) => ({ at: n.at, item: n }))].sort((a, b) => a.at.localeCompare(b.at));
  let lastDay = "";
  for (const { at, item } of merged) {
    const d = dayLabel(at);
    if (d !== lastDay) { items.push({ kind: "day", label: d }); lastDay = d; }
    items.push(item);
  }
  const lastInId = [...msgs].reverse().find((m) => m.direction === "in")?.id;

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-lg px-2xl py-xl">
      {items.map((it, i) => {
        if (it.kind === "day") return <DayDivider key={`d${i}`} label={it.label} />;
        if (it.kind === "note") return <NoteItem key={it.id} body={it.body} userId={it.userId} at={it.at} />;
        return <MessageItem key={it.m.id} m={it.m} conv={conv} isLastIn={it.m.id === lastInId} onReply={onReply} />;
      })}
    </div>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-base">
      <span className="h-px flex-1 bg-[var(--core-border-main-subtle)]" />
      <span className="text-xs leading-xs font-medium uppercase text-[var(--core-text-main-tertiary)]">{label}</span>
      <span className="h-px flex-1 bg-[var(--core-border-main-subtle)]" />
    </div>
  );
}

function NoteItem({ body, userId, at }: { body: string; userId: string; at: string }) {
  const t = team.find((x) => x.id === userId)!;
  return (
    <div className="ml-6xl rounded-lg border border-[var(--core-border-specific-tags-yellow)] bg-[var(--core-bg-specific-tags-yellow)] px-lg py-md">
      <div className="mb-xs text-sm leading-sm font-medium text-[var(--core-text-specific-tags-yellow)]">Internal note · {t.name} · {fmtDate(at)}</div>
      <p className="text-base leading-base whitespace-pre-wrap text-[var(--core-text-main-primary)]">{body}</p>
    </div>
  );
}

function Event({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]">
      <Icon icon={icon} size="xs" />
      <span>{children}</span>
    </div>
  );
}

const who = (p: Person, meId: string) => (team.find((t) => t.email === p.email)?.id === meId ? "You" : p.name);

function SourceLine({ m }: { m: Message }) {
  const camp = m.campaignId ? campaigns.find((c) => c.id === m.campaignId) : undefined;
  const s = useInbox();
  return (
    <div className="flex flex-wrap items-center gap-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]">
      <ChannelIcon channel={m.channel} size="xxs" />
      <span>{CHANNEL_META[m.channel].label}</span>
      <span>·</span>
      {camp && m.source === "campaign" ? (
        <>
          <ObjectButton type="campaign" emoji={camp.emoji} label={camp.name} className="max-w-[220px]" />
          {m.stepName && <span>· {m.stepName}</span>}
        </>
      ) : (
        s.has("all_messages") ? <Badge type={m.source === "external" ? "violet" : "neutral"} size="sm">{sourceLabel(m.source, m.channel, m.direction)}</Badge> : <span>{sourceLabel(m.source, m.channel, m.direction)}</span>
      )}
      <span>· {fmtDate(m.sentAt)}</span>
    </div>
  );
}

function Attachments({ m }: { m: Message }) {
  if (!m.attachments?.length) return null;
  return (
    <div className="mt-md flex flex-wrap gap-base">
      {m.attachments.map((a) => (
        <span key={a.name} className="inline-flex items-center gap-base rounded-base border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)] px-md py-sm">
          <Icon icon={faFileOutline} size="sm" className="text-[var(--core-text-main-secondary)]" />
          <span className="flex flex-col">
            <span className="text-sm leading-sm font-medium text-[var(--core-text-main-primary)]">{a.name}</span>
            <span className="text-xs leading-xs text-[var(--core-text-main-tertiary)]">{a.kind.toUpperCase()} · {a.size}</span>
          </span>
          <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faDownloadOutline} aria-label="Download" />
        </span>
      ))}
    </div>
  );
}

function MessageItem({ m, conv, isLastIn, onReply }: { m: Message; conv: Conversation; isLastIn: boolean; onReply: (m: Message, mode: ReplyMode) => void }) {
  const s = useInbox();
  const [open, setOpen] = useState(isLastIn || m.direction === "in" || !!m.scheduledFor);
  const [oooOpen, setOooOpen] = useState(false);
  const out = m.direction === "out";
  const isOtherPerson = m.direction === "in" && m.from.email !== conv.person.email && m.from.name !== conv.person.name;

  // ── Events ──
  if (m.meta?.kind === "linkedin_invite_accepted") return <Event icon={faUserPlusOutline}>{conv.person.name} accepted your LinkedIn invitation · {fmtDate(m.sentAt)}</Event>;

  if (m.meta?.kind === "call") {
    return (
      <div className="rounded-lg border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] px-lg py-md">
        <SourceLine m={m} />
        <div className="mt-xs text-base leading-base font-medium text-[var(--core-text-main-primary)]">
          {out ? "Outbound call" : "Inbound call"} · {Math.round((m.meta.duration ?? 0) / 60)} min · {m.meta.outcome}
        </div>
        {m.meta.recordingSummary && (
          <div className="mt-base flex gap-base rounded-base bg-[var(--core-bg-main-primary)] p-md">
            <Icon icon={faStarsOutline} size="sm" className="ai-grad-text" />
            <p className="text-sm leading-sm text-[var(--core-text-main-secondary)]">{m.meta.recordingSummary}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Out of office (collapsed) ──
  if (m.autoReply?.kind === "ooo") {
    return (
      <div className="flex flex-col items-center gap-xs">
        <button type="button" onClick={() => setOooOpen((v) => !v)} className="inline-flex items-center gap-xs rounded-full border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] px-md py-xs text-sm leading-sm text-[var(--core-text-main-secondary)] hover:bg-[var(--core-bg-main-hover)]">
          <Icon icon={faPlaneOutline} size="xs" />
          Out of office{m.autoReply.backOn ? ` until ${new Date(m.autoReply.backOn).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}` : ""} · {fmtDate(m.sentAt)}
          <Icon icon={oooOpen ? faChevronUpOutline : faChevronDownOutline} size="xxs" />
        </button>
        {oooOpen && <p className="max-w-[560px] rounded-base bg-[var(--core-bg-main-secondary)] px-lg py-md text-sm leading-sm whitespace-pre-wrap text-[var(--core-text-main-secondary)]">{m.body}</p>}
      </div>
    );
  }

  // ── Forwarded by the contact to a colleague (internal, not a reply) ──
  if (m.forwarded && m.direction === "in") {
    return (
      <div className="flex flex-col items-center gap-xs">
        <Event icon={faForwardOutline}>{m.from.name} forwarded your email to {m.to.map((p) => p.name).join(", ")} · {fmtDate(m.sentAt)}</Event>
        {s.has("participants") && <span className="text-xs leading-xs text-[var(--core-text-main-tertiary)]">Not counted as a reply. {m.to[0]?.name} is now a participant of this conversation.</span>}
      </div>
    );
  }

  const bubble = m.channel !== "email";
  const sender = out ? team.find((t) => t.id === m.userId) : undefined;

  // ── Chat bubbles: LinkedIn, WhatsApp, SMS ──
  if (bubble) {
    return (
      <div className={cn("flex gap-md", out && "flex-row-reverse")}>
        {!out && <PersonAvatar person={m.from} size="sm" />}
        <div className={cn("flex max-w-[70%] flex-col gap-xs", out && "items-end")}>
          <SourceLine m={m} />
          {m.meta?.kind === "linkedin_invite" && <Badge type="info" size="sm" icon={faUserPlusOutline}>Invitation note</Badge>}
          <div className={cn("rounded-xl px-lg py-md text-base leading-base whitespace-pre-wrap",
            out ? "bg-[var(--core-bg-functional-invert-info)] text-[var(--core-text-main-primary)]" : "border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] text-[var(--core-text-main-primary)]")}>
            {m.body}
            <Attachments m={m} />
          </div>
          {out && sender && sender.id !== s.me && <span className="text-xs leading-xs text-[var(--core-text-main-tertiary)]">Sent by {sender.name}</span>}
          {!out && isLastIn && <ReplyButtons m={m} onReply={onReply} />}
        </div>
      </div>
    );
  }

  // ── Email card ──
  const ccAdded = m.cc.length > 0 && m.direction === "in";
  return (
    <div className={cn("flex flex-col gap-xs", out && "pl-6xl")}>
      {ccAdded && s.has("participants") && (
        <Event icon={faUserOutline}>{m.from.name} added {m.cc.filter((p) => p.email !== conv.person.email).map((p) => p.name).join(", ") || m.cc.map((p) => p.name).join(", ")} to this conversation</Event>
      )}
      <div className={cn("rounded-lg border px-lg py-md", out ? "border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)]" : "border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)]", m.scheduledFor && "border-dashed")}>
        <div className="flex items-start gap-md">
          <PersonAvatar person={m.from} size="sm" />
          <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => setOpen((v) => !v)}>
            <div className="flex w-full items-center gap-xs">
              <span className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">{who(m.from, s.me)}</span>
              {isOtherPerson && <Badge type="sky" size="sm">{s.has("participants") ? "Participant" : "Reply received from a contact CC'ed in an email"}</Badge>}
              {m.scheduledFor && <Badge type="info" size="sm" icon={faClockOutline}>Scheduled · {fmtDate(m.scheduledFor)}</Badge>}
              {m.attachments?.length ? <Icon icon={faPaperclipOutline} size="xxs" className="text-[var(--core-text-main-tertiary)]" /> : null}
              <span className="flex-1" />
              <Icon icon={open ? faChevronUpOutline : faChevronDownOutline} size="xs" className="text-[var(--core-text-main-tertiary)]" />
            </div>
            {open ? (
              <div className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">
                to {m.to.map((p) => who(p, s.me)).join(", ")}{m.cc.length ? ` · cc ${m.cc.map((p) => who(p, s.me)).join(", ")}` : ""}
              </div>
            ) : (
              <div className="line-clamp-1 text-sm leading-sm text-[var(--core-text-main-tertiary)]">{m.body}</div>
            )}
          </button>
        </div>
        {open && (
          <div className="mt-md pl-[44px]">
            {m.subject && <div className="mb-xs text-base leading-base font-medium text-[var(--core-text-main-primary)]">{m.subject}</div>}
            <p className="text-base leading-base whitespace-pre-wrap text-[var(--core-text-main-primary)]">{m.body}</p>
            <Attachments m={m} />
            <div className="mt-md flex flex-wrap items-center justify-between gap-base">
              <SourceLine m={m} />
              {!out && <ReplyButtons m={m} onReply={onReply} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyButtons({ m, onReply }: { m: Message; onReply: (m: Message, mode: ReplyMode) => void }) {
  const s = useInbox();
  const hasCc = m.cc.length > 0;
  return (
    <div className="flex items-center gap-xs">
      <Button appearance="outlined" intent="brand" size="xs" leftIcon={faReplyOutline} onClick={() => onReply(m, "reply")}>Reply</Button>
      {m.channel === "email" && (hasCc || s.has("recipients_edit")) && <Button appearance="outlined" intent="brand" size="xs" leftIcon={faReplyAllOutline} onClick={() => onReply(m, "replyAll")}>Reply all</Button>}
      {m.channel === "email" && s.has("forward") && <Button appearance="ghost" intent="brand" size="xs" leftIcon={faForwardOutline} onClick={() => onReply(m, "forward")}>Forward</Button>}
    </div>
  );
}

export function AiInfo({ children }: { children: React.ReactNode }) {
  return <InfoMessage type="ai" description={children} />;
}
