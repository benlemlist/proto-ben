import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button, ObjectButton, InfoMessage, Badge, EmptyState, Tabs, TabList, TabTrigger, cn,
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuList, DropdownMenuRadixItem, DropdownMenuHeading, DropdownMenuDelimiter,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@l3mpire/ui";
import {
  faClockOutline, faCircleCheckOutline, faCircleCheckSolid, faEllipsisOutline, faStarOutline, faStarSolid, faEyeSlashOutline,
  faTagOutline, faSidebarFlipOutline, faInboxOutline, faStarsOutline, faChevronDownOutline, faLockOutline, faPaperPlaneTopOutline,
} from "@l3mpire/icons";
import { Icon } from "@l3mpire/icons";
import { aiText, isAiFallback, AI_STYLE, LEMLIST_CONTEXT } from "../../../lib/ai";
import { useInbox } from "../store";
import { visibleMessages, channelsOf, AI_AUTO_APPLY } from "../logic";
import { campaigns, labels, inDays, team } from "../data";
import { ChannelIcon, PersonAvatar } from "./shared";
import { CHANNEL_META, INTEREST_META, kbd } from "./meta";
import { Timeline, type ReplyMode } from "./Timeline";
import { Composer } from "./Composer";
import { faArrowRotateLeftOutline, faUserPlusOutline, faBanOutline } from "../icons";
import type { Channel, Interest, Message } from "../types";

const SNOOZES = [
  { label: "Later today", sub: "in 3 hours", at: () => new Date(Date.now() + 3 * 3600_000).toISOString() },
  { label: "Tomorrow", sub: "8:00 AM", at: () => inDays(1, 8) },
  { label: "Next Monday", sub: "8:00 AM", at: () => inDays(((8 - new Date().getDay()) % 7) || 7, 8) },
  { label: "In 1 week", sub: "", at: () => inDays(7, 8) },
  { label: "In 1 month", sub: "", at: () => inDays(30, 8) },
];

export function ConversationView() {
  const s = useInbox();
  const conv = s.convs.find((c) => c.id === s.selectedId);
  const [reply, setReply] = useState<{ mode: ReplyMode; msg?: Message }>({ mode: "reply" });
  const [channelTab, setChannelTab] = useState<"all" | Channel>("all");
  const [thread, setThread] = useState<string | "all">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const msgs = useMemo(() => (conv ? visibleMessages(conv, s.ctx, { untrackedView: s.scope.view === "untracked" }) : []), [conv, s.ctx, s.scope.view]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [s.selectedId, msgs.length]);

  if (!conv) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--core-bg-main-primary)]">
        <EmptyState icon={faInboxOutline} title="No conversation selected" description="Pick a conversation on the left." size="md" />
      </div>
    );
  }

  const chans = channelsOf(conv, s.ctx);
  const emailThreads = [...new Map(msgs.filter((m) => m.channel === "email").map((m) => [m.threadId, m.subject?.replace(/^(Re|RE|TR|Fwd): /g, "") ?? "(no subject)"])).entries()];
  const shown = msgs.filter((m) => (channelTab === "all" || m.channel === channelTab) && (thread === "all" || m.threadId === thread || m.channel !== "email"));
  const owner = team.find((t) => t.id === conv.ownerId)!;
  const hiddenPrivate = conv.private && conv.ownerId !== s.me && !s.has("privacy_hotfix");

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[var(--core-bg-main-primary)]">
      <Header conv={conv} />

      {/* Banners */}
      <div className="flex flex-col gap-base px-2xl empty:hidden [&:not(:empty)]:pt-md">
        {hiddenPrivate && (
          <InfoMessage type="alert" title="Production bug: private conversation exposed"
            description={`This is ${owner.name}'s personal LinkedIn conversation. Today any teammate can read it (no sender filter in getActivities). Lot 1 hides it.`} />
        )}
        {conv.unknown && <UnknownBanner convId={conv.id} name={conv.person.name} />}
        {s.has("ai_summary") && msgs.length >= 4 && <SummaryBanner convId={conv.id} msgs={msgs} />}
        {s.has("ai_suggest") && !conv.interest && conv.ai && msgs.some((m) => m.direction === "in" && !m.autoReply) && (
          <AiBanner convId={conv.id} interest={conv.ai.interest} confidence={conv.ai.confidence} reason={conv.ai.reason} />
        )}
        {s.has("ai_suggest") && conv.interest && conv.interestSetBy === "ai" && (
          <InfoMessage type="ai" description={<span>Marked <b>{INTEREST_META[conv.interest].label}</b> by AI ({Math.round((conv.ai?.confidence ?? 0.9) * 100)}% sure, above the {Math.round(AI_AUTO_APPLY * 100)}% threshold).</span>}
            action={<Button appearance="outlined" intent="brand" size="sm" onClick={() => s.setInterest(conv.id, null)}>Undo</Button>} />
        )}
        {s.has("ai_next_step") && conv.ai && <NextStep convId={conv.id} msgs={msgs} />}
      </div>

      {/* Channel and thread filters (lot 4) */}
      {s.has("threads") && (chans.length > 1 || emailThreads.length > 1) && (
        <div className="flex items-center gap-base border-b border-[var(--core-border-main-subtle)] px-2xl">
          <Tabs value={channelTab} onValueChange={(v) => { setChannelTab(v as "all" | Channel); setThread("all"); }}>
            <TabList>
              <TabTrigger value="all" badge={String(msgs.length)}>All channels</TabTrigger>
              {chans.map((ch) => <TabTrigger key={ch} value={ch} badge={String(msgs.filter((m) => m.channel === ch).length)}>{CHANNEL_META[ch].label}</TabTrigger>)}
            </TabList>
          </Tabs>
          <span className="flex-1" />
          {emailThreads.length > 1 && (channelTab === "all" || channelTab === "email") && (
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild>
                <Button appearance="ghost" intent="brand" size="xs" rightIcon={faChevronDownOutline}>{thread === "all" ? `${emailThreads.length} email threads` : emailThreads.find(([id]) => id === thread)?.[1]}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[320px]">
                <DropdownMenuList>
                  <DropdownMenuRadixItem label="All threads" selected={thread === "all"} onSelect={() => setThread("all")} />
                  {emailThreads.map(([id, subj]) => <DropdownMenuRadixItem key={id} label={subj} selected={thread === id} onSelect={() => setThread(id)} />)}
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          )}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className={cn("flex-1 overflow-y-auto", !s.has("composer_inline") && "pb-[120px]")}>
          <Timeline conv={conv} msgs={shown} onReply={(m, mode) => setReply({ mode, msg: m })} />
        </div>
        {!conv.unknown || s.has("all_messages") ? (
          <Composer key={`${conv.id}-${reply.mode}-${reply.msg?.id ?? ""}`} conv={conv} msgs={msgs} replyTo={reply.msg} mode={reply.mode} onModeChange={(mode) => setReply({ mode })} overlay={!s.has("composer_inline")} />
        ) : null}
      </div>
    </div>
  );
}

function Header({ conv }: { conv: NonNullable<ReturnType<typeof useInbox>["convs"][number]> }) {
  const s = useInbox();
  const fav = conv.favoriteBy.includes(s.me);
  const done = conv.status === "done";
  const camps = conv.campaignIds.map((id) => campaigns.find((c) => c.id === id)!).filter(Boolean);
  const chans = channelsOf(conv, s.ctx);
  const owner = team.find((t) => t.id === conv.ownerId)!;
  const workflow = s.has("status_workflow");

  const statusLabel = conv.status === "open" ? "Open" : conv.status === "pending" ? "Waiting for reply" : conv.status === "snoozed" ? `Snoozed until ${conv.snoozeUntil ? new Date(conv.snoozeUntil).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""}` : "Done";
  const statusIcon = conv.status === "done" ? faCircleCheckSolid : conv.status === "snoozed" ? faClockOutline : conv.status === "pending" ? faPaperPlaneTopOutline : faInboxOutline;

  const tip = (label: string, node: React.ReactElement) => (
    <Tooltip><TooltipTrigger asChild>{node}</TooltipTrigger><TooltipContent side="bottom">{label}</TooltipContent></Tooltip>
  );

  return (
    <TooltipProvider>
      <header className="flex flex-col gap-base border-b border-[var(--core-border-main-subtle)] px-2xl py-md">
        <div className="flex items-start gap-md">
          <PersonAvatar person={conv.person} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2xs">
            <div className="flex items-center gap-xs">
              <span className="truncate text-md leading-md font-semibold text-[var(--core-text-main-primary)]">{conv.person.name}</span>
              {conv.private && s.has("private") && <Badge type="neutral" size="sm" icon={faLockOutline}>Private</Badge>}
              {chans.map((ch) => <ChannelIcon key={ch} channel={ch} size="xs" />)}
            </div>
            <div className="flex flex-wrap items-center gap-xs text-sm leading-sm text-[var(--core-text-main-secondary)]">
              {conv.person.jobTitle && <span>{conv.person.jobTitle} at</span>}
              {conv.person.companyName && <ObjectButton type="company" label={conv.person.companyName} initials={conv.person.companyName.slice(0, 2)} />}
              {camps.length > 0 && <span>·</span>}
              {camps.slice(0, 2).map((c) => <ObjectButton key={c.id} type="campaign" emoji={c.emoji} label={c.name} className="max-w-[200px]" />)}
              {camps.length > 2 && <Badge type="neutral" size="sm">+{camps.length - 2}</Badge>}
              {conv.ownerId !== s.me && <span>· Owner: {owner.name}</span>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-xs">
            {workflow && (
              <span className="mr-xs inline-flex items-center gap-xs text-sm leading-sm text-[var(--core-text-main-secondary)]" title="Status follows your actions">
                <ChannelIconish icon={statusIcon} /> {statusLabel}
              </span>
            )}
            <SnoozeMenu convId={conv.id} snoozed={conv.status === "snoozed"} />
            {tip(done ? (workflow ? "Reopen" : "Restore") : workflow ? "Done · E" : "Archive conversation",
              <Button appearance={done ? "outlined" : "solid"} intent="brand" size="sm" leftIcon={done ? faArrowRotateLeftOutline : faCircleCheckOutline}
                onClick={() => (done ? s.reopen(conv.id) : s.markDone(conv.id))}>
                {done ? (workflow ? "Reopen" : "Restore") : workflow ? "Done" : "Archive"}
              </Button>)}
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild><Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faEllipsisOutline} aria-label="More" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[260px]">
                <DropdownMenuList>
                  <DropdownMenuRadixItem icon={faEyeSlashOutline} label={s.has("team_unread") ? "Mark as unread for me" : "Mark as unread for all the team"} onSelect={() => { s.markRead(conv.id, false); s.toast({ type: "info", title: "Conversation marked as unread" }); }} />
                  <DropdownMenuRadixItem icon={fav ? faStarSolid : faStarOutline} label={fav ? "Unfavorite" : "Favorite"} onSelect={() => s.toggleFavorite(conv.id)} />
                  <DropdownMenuDelimiter bleed />
                  <DropdownMenuHeading>Tags</DropdownMenuHeading>
                  {labels.map((l) => <DropdownMenuRadixItem key={l.id} icon={faTagOutline} label={l.name} checkbox checked={conv.labels.includes(l.id)} onSelect={(e) => { e.preventDefault(); s.toggleLabel(conv.id, l.id); }} />)}
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenuRoot>
            {tip(s.panelOpen ? "Hide contact panel" : "Show contact panel",
              <Button appearance={s.panelOpen ? "outlined" : "ghost"} intent="brand" size="sm" iconOnly leftIcon={faSidebarFlipOutline} aria-label="Contact panel" onClick={() => s.setPanelOpen(!s.panelOpen)} />)}
          </div>
        </div>

        {/* Interest in one click (lot 3) vs production's CRM "Contact Status" */}
        {s.has("interest_header") ? (
          <div className="flex flex-wrap items-center gap-xs">
            <span className="mr-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]">Interest</span>
            {(Object.keys(INTEREST_META) as Interest[]).map((i) => {
              const on = conv.interest === i;
              const m = INTEREST_META[i];
              return <span key={i}>{tip(`${m.label} · ${m.key}`,
                <Button appearance={on ? "solid" : "outlined"} intent={i === "not_interested" && on ? "alert" : "brand"} size="xs" leftIcon={m.icon}
                  onClick={() => s.setInterest(conv.id, on ? null : i)}>{m.label}</Button>)}</span>;
            })}
            {s.has("shortcuts") && <span className="ml-auto hidden items-center gap-xs text-xs leading-xs text-[var(--core-text-main-tertiary)] xl:flex"><span className={kbd}>J</span><span className={kbd}>K</span> navigate · <span className={kbd}>R</span> reply · <span className={kbd}>E</span> done · <span className={kbd}>?</span> all shortcuts</span>}
          </div>
        ) : (
          <div className="flex items-center gap-xs">
            <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Contact Status</span>
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="xs" rightIcon={faChevronDownOutline}>Lead</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                <DropdownMenuList>
                  {["Lead", "Qualified", "Opportunity", "Customer"].map((x) => <DropdownMenuRadixItem key={x} label={x} selected={x === "Lead"} />)}
                  <DropdownMenuDelimiter bleed />
                  <DropdownMenuRadixItem label="Edit lifecycles" />
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenuRoot>
            <span className="text-xs leading-xs text-[var(--core-text-main-tertiary)]">· Interest is set from the contact panel</span>
          </div>
        )}
      </header>
    </TooltipProvider>
  );
}

function ChannelIconish({ icon }: { icon: string }) {
  return <Icon icon={icon} size="xs" />;
}

function SnoozeMenu({ convId, snoozed }: { convId: string; snoozed: boolean }) {
  const s = useInbox();
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="sm" leftIcon={faClockOutline}>{snoozed ? "Snoozed" : "Snooze"}</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuList>
          <DropdownMenuHeading>Snooze conversation</DropdownMenuHeading>
          {SNOOZES.map((o) => <DropdownMenuRadixItem key={o.label} label={o.label} sublabel={o.sub} onSelect={() => s.snooze(convId, o.at(), o.label.toLowerCase())} />)}
          {snoozed && <><DropdownMenuDelimiter bleed /><DropdownMenuRadixItem label="Unsnooze conversation" onSelect={() => s.unsnooze(convId)} /></>}
        </DropdownMenuList>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

function AiBanner({ convId, interest, confidence, reason }: { convId: string; interest: Interest; confidence: number; reason: string }) {
  const s = useInbox();
  const low = confidence < 0.7;
  return (
    <InfoMessage type="ai"
      title={`AI suggests: ${INTEREST_META[interest].label} · ${Math.round(confidence * 100)}% sure`}
      description={`${reason}${low ? " Low confidence, please check." : ""}`}
      action={
        <div className="flex items-center gap-xs">
          <Button appearance="solid" intent="ai" size="sm" leftIcon={faStarsOutline} onClick={() => s.setInterest(convId, interest, "user")}>Confirm</Button>
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="sm" rightIcon={faChevronDownOutline}>Change</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuList>
                {(Object.keys(INTEREST_META) as Interest[]).filter((i) => i !== interest).map((i) => <DropdownMenuRadixItem key={i} icon={INTEREST_META[i].icon} label={INTEREST_META[i].label} onSelect={() => s.setInterest(convId, i, "user")} />)}
              </DropdownMenuList>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      } />
  );
}

function UnknownBanner({ convId, name }: { convId: string; name: string }) {
  const s = useInbox();
  return (
    <InfoMessage type="warning" title={`${name} is not a contact yet`}
      description="Only you see this conversation. Add them to log it on a contact, sync it to your CRM and share it with your team."
      action={
        <div className="flex items-center gap-xs">
          <Button appearance="solid" intent="brand" size="sm" leftIcon={faUserPlusOutline} onClick={() => s.addAsContact(convId)}>Add as contact</Button>
          <Button appearance="outlined" intent="brand" size="sm" onClick={() => s.ignoreUnknown(convId)}>Ignore</Button>
          <Button appearance="ghost" intent="alert" size="sm" leftIcon={faBanOutline} onClick={() => s.neverLog(convId)}>Never log</Button>
        </div>
      } />
  );
}

function SummaryBanner({ convId, msgs }: { convId: string; msgs: Message[] }) {
  const [text, setText] = useState<string>("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setText(""); }, [convId]);
  const run = async () => {
    setBusy(true); setText("");
    const thread = msgs.map((m) => `${m.direction === "in" ? m.from.name : "Rep"} (${m.channel}, ${m.sentAt.slice(0, 10)}): ${m.meta?.recordingSummary ?? m.body}`).join("\n");
    try {
      await aiText({ system: `${LEMLIST_CONTEXT} ${AI_STYLE}`, prompt: `Summarize this sales conversation in 2 short sentences: where it stands and the next step.\n\n${thread}`, onText: (d) => setText((t) => t + d) });
    } catch (err) {
      if (!isAiFallback(err)) console.error(err);
      const last = [...msgs].reverse().find((m) => m.direction === "in");
      setText(`${msgs.length} messages on ${new Set(msgs.map((m) => m.channel)).size} channels. Last from ${last?.from.name ?? "the contact"}: "${(last?.body ?? "").slice(0, 110)}…"`);
    } finally { setBusy(false); }
  };
  if (!text && !busy) return <div><Button appearance="ghost" intent="ai" size="xs" leftIcon={faStarsOutline} onClick={run}>Summarize conversation</Button></div>;
  return <InfoMessage type="ai" title="Summary" description={busy && !text ? "Reading the conversation…" : text} onClose={() => setText("")} />;
}

function NextStep({ convId, msgs }: { convId: string; msgs: Message[] }) {
  const s = useInbox();
  const last = [...msgs].reverse().find((m) => m.direction === "in" && !m.autoReply);
  if (!last) return null;
  const t = last.body.toLowerCase();
  let step: { title: string; action: string; onClick: () => void } | null = null;
  const email = last.body.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
  if (email && /(voyez|talk to|try|contact)/.test(t)) step = { title: `Referral to ${email}`, action: "Add to a campaign", onClick: () => s.toast({ type: "success", title: `${email} added to "Cold — Ops Directors FR"`, subtitle: "With a first line that mentions the referral." }) };
  else if (/(demo|call|thursday|jeudi|meeting|créneau|invite|tuesday)/.test(t)) step = { title: "They want to meet", action: "Insert lemcal link", onClick: () => s.toast({ type: "info", title: "Use “lemcal link” in the composer", subtitle: "Or let AI suggest a reply with your calendar." }) };
  else if (/(price|pricing|tarif|quote|devis|cost)/.test(t)) step = { title: "Pricing asked", action: "Insert pricing template", onClick: () => s.toggleLabel(convId, "lbl_pricing") };
  else if (/(march|mars|september|septembre|q2|later|10 days)/.test(t)) step = { title: "Asked to come back later", action: "Snooze until then", onClick: () => s.snooze(convId, inDays(60, 8), "in 2 months") };
  if (!step) return null;
  return (
    <InfoMessage type="ai" title={`Next step · ${step.title}`} description="Suggested from the last reply."
      action={<Button appearance="outlined" intent="ai" size="sm" leftIcon={faStarsOutline} onClick={step.onClick}>{step.action}</Button>} />
  );
}
