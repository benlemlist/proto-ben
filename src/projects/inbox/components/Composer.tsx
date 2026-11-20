// Composer. Lot 1: in the flow (never over the conversation), draft saved and visible.
// Lot 2: To / CC / BCC editable with any address, Reply all, Forward, attachments, lemcal link, schedule.
// Lot 5: internal note tab. Lot 6: AI suggested reply (human sends).
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button, ChipInput, Badge, cn, Tabs, TabList, TabTrigger,
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuList, DropdownMenuRadixItem, DropdownMenuHeading,
} from "@l3mpire/ui";
import { faChevronDownOutline, faStarsOutline, faClockOutline, faShapesOutline, faXmarkOutline, faFileOutline, faPaperPlaneTopOutline, faCalendarOutline } from "@l3mpire/icons";
import { aiText, isAiFallback, AI_STYLE, LEMLIST_CONTEXT } from "../../../lib/ai";
import { useInbox } from "../store";
import { inDays, team } from "../data";
import { ChannelIcon } from "./shared";
import { CHANNEL_META } from "./meta";
import { faPaperclipOutline } from "../icons";
import type { ReplyMode } from "./Timeline";
import type { Attachment, Channel, Conversation, Message, Person } from "../types";

const TEMPLATES = [
  { name: "Book a demo", body: "Thanks for your reply! Here is my calendar to pick a 20 min slot that works for you: {{lemcal}}" },
  { name: "Pricing overview", body: "Here is our pricing: Starter at €29 per technician per month, Business at €49 with routing and offline mode. Happy to walk you through it." },
  { name: "Case study — energy", body: "Here is how Enel X's installer network cut report time by 52% with Fieldbase." },
  { name: "Not the right time", body: "Totally understand. I'll reach out next quarter. In the meantime, here is a 2 min video in case it helps." },
];
const SAMPLE_FILES: Attachment[] = [
  { name: "Fieldbase-pricing-2027.pdf", kind: "pdf", size: "640 KB" },
  { name: "Import-template-technicians.csv", kind: "csv", size: "4 KB" },
  { name: "ROI-calculator.xlsx", kind: "xlsx", size: "92 KB" },
];
const LEMCAL = "https://lemcal.com/alice-fieldbase/demo-20min";

const personFrom = (value: string, known: Person[]): Person => known.find((p) => p.email === value || p.name === value) ?? { contactId: null, name: value, email: value };
const label = (p: Person) => p.email ?? p.name;

export function Composer({ conv, msgs, replyTo, mode, onModeChange, overlay }: {
  conv: Conversation; msgs: Message[]; replyTo?: Message; mode: ReplyMode; onModeChange: (m: ReplyMode) => void; overlay?: boolean;
}) {
  const s = useInbox();
  const me = team.find((t) => t.id === s.me)!;
  const known = useMemo(() => [conv.person, ...conv.participants, ...msgs.flatMap((m) => [m.from, ...m.to, ...m.cc])], [conv, msgs]);

  const availableChannels: Channel[] = useMemo(() => {
    const set = new Set<Channel>();
    if (conv.person.email) set.add("email");
    if (conv.person.linkedinUrl) set.add("linkedin");
    if (conv.person.phone) { set.add("whatsapp"); set.add("sms"); }
    for (const m of msgs) if (m.channel !== "call") set.add(m.channel);
    return [...set];
  }, [conv, msgs]);

  const lastIn = replyTo ?? [...msgs].reverse().find((m) => m.direction === "in" && !m.autoReply && !m.forwarded);
  const defaultChannel: Channel = lastIn?.channel === "call" ? "email" : lastIn?.channel ?? availableChannels[0] ?? "email";

  const initial = () => {
    if (conv.draft) return { channel: conv.draft.channel, to: conv.draft.to.map(label), cc: conv.draft.cc.map(label), bcc: conv.draft.bcc.map(label), subject: conv.draft.subject ?? "", body: conv.draft.body };
    const isMine = (p: Person) => team.some((t) => t.email === p.email);
    const replyToPerson = lastIn && !isMine(lastIn.from) ? lastIn.from : conv.person;
    const to = mode === "forward" ? [] : [label(replyToPerson)];
    const cc = mode === "replyAll" && lastIn ? [...lastIn.to, ...lastIn.cc].filter((p) => !isMine(p) && label(p) !== label(replyToPerson)).map(label) : [];
    const subj = lastIn?.subject ? (mode === "forward" ? `Fwd: ${lastIn.subject.replace(/^(Re|RE|Fwd|TR): /, "")}` : lastIn.subject.startsWith("Re:") || lastIn.subject.startsWith("RE:") ? lastIn.subject : `Re: ${lastIn.subject}`) : "";
    const body = mode === "forward" && lastIn ? `\n\n---------- Forwarded message ----------\nFrom: ${lastIn.from.name} <${lastIn.from.email ?? ""}>\n\n${lastIn.body}` : "";
    return { channel: defaultChannel, to, cc, bcc: [] as string[], subject: subj, body };
  };

  const [tab, setTab] = useState<"reply" | "note">("reply");
  const [state, setState] = useState(initial);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showCc, setShowCc] = useState(() => state.cc.length > 0 || state.bcc.length > 0);
  const [savedAt, setSavedAt] = useState<string | undefined>(conv.draft?.savedAt);
  const [aiBusy, setAiBusy] = useState(false);
  // Collapsed by default (more room for the conversation); a Reply button or a draft opens it.
  const [collapsed, setCollapsed] = useState(() => !conv.draft && !replyTo);
  const [note, setNote] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);


  // Draft autosave (lot 1 shows it). Production saves drafts too; the label is what's new.
  useEffect(() => {
    if (!state.body.trim()) return;
    const t = setTimeout(() => {
      const now = new Date().toISOString();
      s.saveDraft(conv.id, { channel: state.channel, to: state.to.map((v) => personFrom(v, known)), cc: state.cc.map((v) => personFrom(v, known)), bcc: state.bcc.map((v) => personFrom(v, known)), subject: state.subject, body: state.body, savedAt: now });
      setSavedAt(now);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const set = (patch: Partial<typeof state>) => setState((x) => ({ ...x, ...patch }));
  const insert = (text: string) => {
    // Keep the scroll where it is (prod bug: the view jumps when a template is inserted).
    const el = textRef.current;
    const pos = el ? el.selectionStart : state.body.length;
    const next = state.body.slice(0, pos) + text + state.body.slice(pos);
    set({ body: next });
    requestAnimationFrame(() => { if (el) { el.focus({ preventScroll: true }); el.selectionStart = el.selectionEnd = pos + text.length; } });
  };

  const send = (scheduledFor?: string) => {
    if (tab === "note") { if (note.trim()) { s.addNote(conv.id, note.trim()); setNote(""); s.toast({ type: "success", title: "Note added", subtitle: "Only your team sees it." }); } return; }
    if (!state.body.trim()) return;
    s.send({
      convId: conv.id, channel: state.channel,
      to: state.to.map((v) => personFrom(v, known)), cc: state.cc.map((v) => personFrom(v, known)), bcc: state.bcc.map((v) => personFrom(v, known)),
      subject: state.channel === "email" ? state.subject : undefined, body: state.body.replace("{{lemcal}}", LEMCAL), attachments, scheduledFor, forward: mode === "forward",
    });
    setState({ ...initial(), body: "" });
    setAttachments([]);
    setSavedAt(undefined);
    if (mode !== "reply") onModeChange("reply");
  };

  const suggest = async () => {
    setAiBusy(true);
    const thread = msgs.slice(-6).map((m) => `${m.direction === "in" ? m.from.name : "Me"} (${m.channel}): ${m.body}`).join("\n");
    const mock = mockReply(conv, lastIn);
    try {
      set({ body: "" });
      await aiText({
        system: `${LEMLIST_CONTEXT} ${AI_STYLE} You write the next reply of a sales rep named ${me.firstName} at Fieldbase (field-service software). Answer in the language of the prospect. 80 words max. No subject line. Sign with ${me.firstName}.`,
        prompt: `Conversation:\n${thread}\n\nWrite the reply.`,
        onText: (d) => setState((x) => ({ ...x, body: x.body + d })),
      });
    } catch (err) {
      if (!isAiFallback(err)) console.error(err);
      set({ body: mock });
    } finally { setAiBusy(false); }
  };

  const inline = !overlay;
  const isEmail = state.channel === "email";
  const editable = s.has("recipients_edit");

  if (collapsed && inline) {
    return (
      <div className="border-t border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] px-2xl py-md">
        <Button appearance="outlined" intent="brand" size="md" className="w-full justify-start" onClick={() => setCollapsed(false)}>
          {conv.draft ? `Draft · ${conv.draft.body.slice(0, 60)}…` : `Reply to ${conv.person.name.split(" ")[0]}…`}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-base border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] px-xl py-md",
      inline ? "border-t" : "absolute inset-x-xl bottom-xl rounded-lg border shadow-lg",
    )}>
      <div className="flex items-center gap-base">
        {s.has("notes") ? (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "reply" | "note")}>
            <TabList>
              <TabTrigger value="reply">{mode === "forward" ? "Forward" : mode === "replyAll" ? "Reply all" : "Reply"}</TabTrigger>
              <TabTrigger value="note">Internal note</TabTrigger>
            </TabList>
          </Tabs>
        ) : (
          <span className="text-sm leading-sm font-medium text-[var(--core-text-main-secondary)]">{mode === "forward" ? "Forward" : mode === "replyAll" ? "Reply all" : "Reply"}</span>
        )}
        {tab === "reply" && (
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild>
              <Button appearance="ghost" intent="brand" size="xs" leftIcon={CHANNEL_META[state.channel].icon} rightIcon={faChevronDownOutline}>{CHANNEL_META[state.channel].label}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              <DropdownMenuList>
                <DropdownMenuHeading>Reply on</DropdownMenuHeading>
                {availableChannels.map((ch) => <DropdownMenuRadixItem key={ch} icon={CHANNEL_META[ch].icon} label={CHANNEL_META[ch].label} selected={state.channel === ch} onSelect={() => set({ channel: ch })} />)}
              </DropdownMenuList>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        )}
        <span className="flex-1" />
        {s.has("draft_label") && savedAt && tab === "reply" && <span className="text-xs leading-xs text-[var(--core-text-main-tertiary)]">Draft saved · {new Date(savedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>}
        {inline && <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faChevronDownOutline} aria-label="Collapse composer" onClick={() => setCollapsed(true)} />}
      </div>

      {tab === "note" ? (
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Write a note for your team. Type @ to mention a teammate."
          className="w-full resize-none rounded-base border border-[var(--core-border-specific-tags-yellow)] bg-[var(--core-bg-specific-tags-yellow)] px-md py-sm text-base leading-base text-[var(--core-text-main-primary)] outline-none placeholder:text-[var(--core-text-functional-placeholder)]" />
      ) : (
        <>
          {isEmail && (
            <div className="flex flex-col gap-xs">
              <Recipients label="To" values={state.to} onChange={(v) => set({ to: v })} editable={editable || mode === "forward"} right={
                !showCc ? <Button appearance="ghost" intent="brand" size="xs" onClick={() => setShowCc(true)}>{editable ? "Cc / Bcc" : "Cc"}</Button> : undefined
              } />
              {showCc && <Recipients label="Cc" values={state.cc} onChange={(v) => set({ cc: v })} editable />}
              {showCc && editable && <Recipients label="Bcc" values={state.bcc} onChange={(v) => set({ bcc: v })} editable />}
              <input value={state.subject} onChange={(e) => set({ subject: e.target.value })} placeholder="Subject"
                className="border-b border-[var(--core-border-main-subtle)] bg-transparent py-xs text-base leading-base text-[var(--core-text-main-primary)] outline-none placeholder:text-[var(--core-text-functional-placeholder)]" />
            </div>
          )}
          {!isEmail && (
            <div className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">
              <ChannelIcon channel={state.channel} size="xxs" /> To {conv.person.name} · from {state.channel === "linkedin" ? `${me.name}'s LinkedIn` : state.channel === "whatsapp" ? "WhatsApp Business +33 7 56 12 40 88" : "+33 7 56 12 40 88"}
            </div>
          )}
          <textarea ref={textRef} value={state.body} onChange={(e) => set({ body: e.target.value })} rows={inline ? 4 : 6}
            placeholder={aiBusy ? "Writing a suggestion…" : `Write your ${CHANNEL_META[state.channel].label} message…`}
            className={cn("w-full resize-y rounded-base bg-transparent text-base leading-base text-[var(--core-text-main-primary)] outline-none placeholder:text-[var(--core-text-functional-placeholder)]", aiBusy && "ai-shimmer-text")} />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-xs">
              {attachments.map((a) => <Badge key={a.name} type="neutral" size="md" icon={faFileOutline} onClose={() => setAttachments((x) => x.filter((y) => y.name !== a.name))}>{a.name}</Badge>)}
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-xs">
        {tab === "reply" && (
          <>
            {s.has("attachments") || !isEmail ? (
              <DropdownMenuRoot>
                <DropdownMenuTrigger asChild><Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faPaperclipOutline} aria-label="Attach a file" /></DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[280px]">
                  <DropdownMenuList>
                    <DropdownMenuHeading>Attach (demo files)</DropdownMenuHeading>
                    {SAMPLE_FILES.map((f) => <DropdownMenuRadixItem key={f.name} icon={faFileOutline} label={f.name} sublabel={f.size} onSelect={() => setAttachments((x) => [...x, f])} />)}
                  </DropdownMenuList>
                </DropdownMenuContent>
              </DropdownMenuRoot>
            ) : null}
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild><Button appearance="ghost" intent="brand" size="sm" leftIcon={faShapesOutline}>Templates</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px]">
                <DropdownMenuList>
                  {TEMPLATES.map((t) => <DropdownMenuRadixItem key={t.name} label={t.name} description={t.body.slice(0, 70) + "…"} onSelect={() => insert(t.body)} />)}
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenuRoot>
            {s.has("lemcal") && <Button appearance="ghost" intent="brand" size="sm" leftIcon={faCalendarOutline} onClick={() => insert(` ${LEMCAL} `)}>lemcal link</Button>}
            {s.has("ai_reply") && <Button appearance="ghost" intent="ai" size="sm" leftIcon={faStarsOutline} loading={aiBusy} onClick={suggest}>Suggest a reply</Button>}
          </>
        )}
        <span className="flex-1" />
        {tab === "reply" && mode !== "reply" && <Button appearance="ghost" intent="brand" size="sm" leftIcon={faXmarkOutline} onClick={() => onModeChange("reply")}>Cancel</Button>}
        {tab === "reply" && s.has("schedule") && (
          <DropdownMenuRoot>
            <DropdownMenuTrigger asChild><Button appearance="outlined" intent="brand" size="sm" iconOnly leftIcon={faClockOutline} aria-label="Schedule send" disabled={!state.body.trim()} /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              <DropdownMenuList>
                <DropdownMenuHeading>Schedule send</DropdownMenuHeading>
                <DropdownMenuRadixItem label="Tomorrow morning" sublabel="8:00" onSelect={() => send(inDays(1, 8))} />
                <DropdownMenuRadixItem label="Tomorrow afternoon" sublabel="14:00" onSelect={() => send(inDays(1, 14))} />
                <DropdownMenuRadixItem label="Monday morning" sublabel="9:00" onSelect={() => send(inDays(((8 - new Date().getDay()) % 7) || 7, 9))} />
                <DropdownMenuRadixItem label="In the prospect's timezone" sublabel="9:00 their time" onSelect={() => send(inDays(1, 15))} />
              </DropdownMenuList>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        )}
        <Button appearance="solid" intent="brand" size="sm" leftIcon={faPaperPlaneTopOutline} disabled={tab === "reply" ? !state.body.trim() || (isEmail && state.to.length === 0) : !note.trim()} onClick={() => send()}>
          {tab === "note" ? "Add note" : mode === "forward" ? "Forward" : "Send"}
        </Button>
      </div>
    </div>
  );
}

function Recipients({ label, values, onChange, editable, right }: { label: string; values: string[]; onChange: (v: string[]) => void; editable: boolean; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-base">
      <span className="w-8 shrink-0 text-sm leading-sm text-[var(--core-text-main-tertiary)]">{label}</span>
      <div className="min-w-0 flex-1">
        {editable ? (
          <ChipInput size="sm" values={values} onChange={onChange} placeholder="Add an email and press Enter" />
        ) : (
          <div className="flex flex-wrap gap-xs">{values.map((v) => <Badge key={v} type="neutral" size="sm">{v}</Badge>)}</div>
        )}
      </div>
      {right}
    </div>
  );
}

function mockReply(conv: Conversation, lastIn?: Message): string {
  const first = (lastIn?.from.name ?? conv.person.name).split(" ")[0];
  const fr = /[éèàç]|bonjour|merci/i.test(lastIn?.body ?? "");
  if (fr) return `Bonjour ${first},\n\nMerci pour votre retour ! Je vous propose d'en parler 20 minutes cette semaine, voici mon agenda : ${LEMCAL}\n\nBelle journée,\nAlice`;
  return `Hi ${first},\n\nThanks for getting back to me. Happy to walk you through it in 20 minutes this week. Here is my calendar: ${LEMCAL}\n\nAlice`;
}
