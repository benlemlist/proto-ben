// State of the Inbox proto: data, the signed-in user, the delivery lot, navigation, and
// every action (reply, snooze, done, interest…). Persisted in localStorage so a demo keeps
// its state across reloads; `reset()` (proto commands) goes back to the seed.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { aiObject, isAiFallback, AI_STYLE, LEMLIST_CONTEXT } from "../../lib/ai";
import { ME, seedConversations, seedMessages, team, inDays } from "./data";
import { hasFeature, indexMessages, mockClassify, AI_AUTO_APPLY, type Ctx, type Filters, type Scope, type ViewId } from "./logic";
import type { Feature } from "./lots";
import type { Attachment, Channel, Conversation, Draft, Interest, Message, Person } from "./types";

const STORAGE_KEY = "inbox-q1-2027-proto-v1";

let uidN = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${++uidN}`;

export interface ToastItem {
  id: number;
  type: "info" | "success" | "alert" | "warning";
  title: string;
  subtitle?: string;
  undo?: () => void;
}

interface Persisted {
  convs: Conversation[];
  msgs: Message[];
  me: string;
  lot: number;
  theme: "light" | "dark";
  panelOpen: boolean;
  desktopNotifs: boolean;
}

const seed = (): Persisted => ({
  convs: structuredClone(seedConversations),
  msgs: structuredClone(seedMessages),
  me: ME,
  lot: 6,
  theme: "light",
  panelOpen: true,
  desktopNotifs: false,
});

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* private window: seed */ }
  return seed();
}

export interface SendInput {
  convId: string;
  channel: Channel;
  to: Person[];
  cc: Person[];
  bcc: Person[];
  subject?: string;
  body: string;
  attachments?: Attachment[];
  scheduledFor?: string;
  forward?: boolean;
}

export interface SimulateInput {
  convId?: string;
  channel?: Channel;
  kind: "reply" | "ooo" | "unknown_linkedin" | "unknown_email" | "cc_reply";
  body?: string;
}

function useInboxState() {
  const [data, setData] = useState<Persisted>(load);
  const [scope, setScope] = useState<Scope>(() => ({ view: hasFeature(data.lot, "left_nav") ? "inbox" : "mine", channel: null, teammate: null, label: null }));
  const [filters, setFilters] = useState<Filters>({});
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("cv_marc");
  const [checked, setChecked] = useState<string[]>([]);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", data.theme);
  }, [data.theme]);

  const ctx: Ctx = useMemo(() => ({ me: data.me, lot: data.lot, msgsByConv: indexMessages(data.msgs) }), [data.me, data.lot, data.msgs]);
  const has = useCallback((f: Feature) => hasFeature(data.lot, f), [data.lot]);


  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.undo ? 7000 : 4000);
  }, []);
  const dismissToast = (id: number) => setToasts((ts) => ts.filter((x) => x.id !== id));

  const patchConv = useCallback((id: string, patch: Partial<Conversation> | ((c: Conversation) => Partial<Conversation>)) => {
    setData((d) => ({ ...d, convs: d.convs.map((c) => (c.id === id ? { ...c, ...(typeof patch === "function" ? patch(c) : patch) } : c)) }));
  }, []);

  const getConv = (id: string) => data.convs.find((c) => c.id === id);

  // ─── Read / favorite ────────────────────────────────────────────────────────
  const markRead = useCallback((id: string, read = true) => {
    patchConv(id, (c) => ({ readBy: read ? [...new Set([...c.readBy, data.me])] : c.readBy.filter((u) => u !== data.me) }));
  }, [data.me, patchConv]);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) markRead(id, true);
  }, [markRead]);

  const toggleFavorite = (id: string) =>
    patchConv(id, (c) => ({ favoriteBy: c.favoriteBy.includes(data.me) ? c.favoriteBy.filter((u) => u !== data.me) : [...c.favoriteBy, data.me] }));

  // ─── Workflow ───────────────────────────────────────────────────────────────
  const snooze = (id: string, until: string, label: string) => {
    const before = getConv(id);
    patchConv(id, { status: "snoozed", snoozeUntil: until });
    toast({ type: "info", title: `Snoozed until ${label}`, subtitle: has("snooze_wake") ? "It comes back earlier if they reply." : undefined, undo: before ? () => patchConv(id, { status: before.status, snoozeUntil: before.snoozeUntil }) : undefined });
  };
  const unsnooze = (id: string) => patchConv(id, { status: "open", snoozeUntil: undefined });

  const markDone = (id: string) => {
    const before = getConv(id);
    patchConv(id, { status: "done", snoozeUntil: undefined });
    toast({ type: "success", title: has("status_workflow") ? "Marked as done" : "Archived conversation", subtitle: has("status_workflow") ? "It comes back if they reply." : undefined, undo: before ? () => patchConv(id, { status: before.status }) : undefined });
  };
  const reopen = (id: string) => { patchConv(id, { status: "open" }); toast({ type: "info", title: has("status_workflow") ? "Reopened" : "Restored conversation" }); };

  const setInterest = (id: string, interest: Interest | null, by: "user" | "ai" = "user") => {
    const before = getConv(id);
    patchConv(id, { interest, interestSetBy: interest ? by : undefined });
    const label = interest === "interested" ? "Interested" : interest === "not_interested" ? "Not interested" : interest === "neutral" ? "Neutral" : "No interest set";
    toast({ type: "success", title: `Marked as ${label}`, subtitle: "Lead status updated in its campaigns.", undo: before ? () => patchConv(id, { interest: before.interest, interestSetBy: before.interestSetBy }) : undefined });
  };

  const toggleLabel = (id: string, labelId: string) =>
    patchConv(id, (c) => ({ labels: c.labels.includes(labelId) ? c.labels.filter((l) => l !== labelId) : [...c.labels, labelId] }));

  const addNote = (id: string, body: string) =>
    patchConv(id, (c) => ({ notes: [...c.notes, { id: uid("n"), userId: data.me, body, createdAt: new Date().toISOString() }] }));

  const saveDraft = (id: string, draft: Draft | undefined) => patchConv(id, { draft });

  // ─── Send ───────────────────────────────────────────────────────────────────
  const send = (input: SendInput) => {
    const conv = getConv(input.convId);
    if (!conv) return;
    const meT = team.find((t) => t.id === data.me)!;
    const msg: Message = {
      id: uid("msg_s"),
      convId: input.convId,
      channel: input.channel,
      direction: "out",
      source: "manual",
      threadId: `${input.convId}_t1`,
      userId: data.me,
      from: { contactId: null, name: meT.name, email: meT.email, companyName: "Fieldbase" },
      to: input.to,
      cc: [...input.cc, ...input.bcc],
      subject: input.subject,
      body: input.body,
      sentAt: input.scheduledFor ?? new Date().toISOString(),
      scheduledFor: input.scheduledFor,
      attachments: input.attachments?.length ? input.attachments : undefined,
      forwarded: input.forward,
    };
    setData((d) => ({
      ...d,
      msgs: [...d.msgs, msg],
      convs: d.convs.map((c) => (c.id === input.convId
        ? { ...c, draft: undefined, status: input.forward ? c.status : hasFeature(d.lot, "status_workflow") ? "pending" : c.status, readBy: [...new Set([...c.readBy, d.me])] }
        : c)),
    }));
    if (input.scheduledFor) toast({ type: "success", title: "Message scheduled", subtitle: `Sends ${new Date(input.scheduledFor).toLocaleString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" })}.` });
    else if (input.forward) toast({ type: "success", title: "Forwarded", subtitle: `To ${input.to.map((p) => p.name).join(", ")}` });
    else toast({ type: "success", title: "Message sent", subtitle: hasFeature(data.lot, "status_workflow") ? "Moved to Waiting until they reply." : undefined });
  };

  // ─── Unknown people (lot 4) ───────────────────────────────────────────────────
  const addAsContact = (id: string) => {
    patchConv(id, (c) => ({ unknown: undefined, person: { ...c.person, contactId: uid("ctc_new") } }));
    toast({ type: "success", title: "Added as contact", subtitle: "The conversation moves to your inbox." });
  };
  const ignoreUnknown = (id: string) => {
    patchConv(id, { unknown: { state: "ignored" } });
    toast({ type: "info", title: "Ignored", subtitle: "New messages from this person still show here.", undo: () => patchConv(id, { unknown: { state: "pending" } }) });
  };
  const neverLog = (id: string) => {
    const c = getConv(id);
    setData((d) => ({ ...d, convs: d.convs.filter((x) => x.id !== id), msgs: d.msgs.filter((m) => m.convId !== id) }));
    if (selectedId === id) setSelectedId(null);
    toast({ type: "info", title: "Never logged", subtitle: `${c?.person.email ?? c?.person.name} is on the never-log list.` });
  };
  const addParticipantAsContact = (convId: string, email?: string, name?: string) => {
    patchConv(convId, (c) => ({ participants: c.participants.map((p) => (p.email === email && p.name === name ? { ...p, contactId: uid("ctc_new") } : p)) }));
    toast({ type: "success", title: `${name} added as contact`, subtitle: "Synced to HubSpot." });
  };

  // ─── AI classification of a new reply ────────────────────────────────────────
  const classify = useCallback(async (convId: string, body: string) => {
    let out = mockClassify(body);
    try {
      out = await aiObject<typeof out>({
        system: `${LEMLIST_CONTEXT} ${AI_STYLE} You classify a prospect's reply to a sales message.`,
        prompt: `Reply:\n"""${body}"""\nClassify the lead interest. "neutral" means not now / wrong person / unclear.`,
        name: "classify_reply",
        description: "Lead interest of the reply",
        schema: {
          type: "object",
          properties: {
            interest: { type: "string", enum: ["interested", "not_interested", "neutral"] },
            confidence: { type: "number", description: "0 to 1" },
            reason: { type: "string", description: "One short sentence" },
          },
          required: ["interest", "confidence", "reason"],
        },
      });
    } catch (err) {
      if (!isAiFallback(err)) console.error(err);
    }
    setData((d) => ({
      ...d,
      convs: d.convs.map((c) => {
        if (c.id !== convId) return c;
        const auto = hasFeature(d.lot, "ai_suggest") && out.confidence >= AI_AUTO_APPLY && !c.interest;
        return { ...c, ai: out, ...(auto ? { interest: out.interest, interestSetBy: "ai" as const } : {}) };
      }),
    }));
  }, []);

  // ─── Proto commands: simulate incoming messages ───────────────────────────────
  const simulate = (input: SimulateInput) => {
    const now = new Date().toISOString();
    const lot = data.lot;
    if (input.kind === "unknown_linkedin" || input.kind === "unknown_email") {
      const id = uid("cv_sim");
      const linkedin = input.kind === "unknown_linkedin";
      const person: Person = linkedin
        ? { contactId: null, name: "Malik Johnson", jobTitle: "VP Operations", companyName: "ReachFlow", linkedinUrl: "https://linkedin.com/in/malik-johnson" }
        : { contactId: null, name: "Elena Vasquez", email: "elena@coralops.com", jobTitle: "COO", companyName: "CoralOps" };
      const body = input.body ?? (linkedin
        ? "Hi Alice, a friend told me Fieldbase replaced their dispatch spreadsheets. Could we chat this week?"
        : "Hello, we are 35 technicians and looking for a dispatch tool. Do you have a free trial?");
      const conv: Conversation = { id, person, participants: [], ownerId: data.me, status: "open", readBy: [], favoriteBy: [], private: false, interest: null, labels: [], campaignIds: [], notes: [], unknown: { state: "pending" }, createdAt: now };
      const msg: Message = { id: `msg_${id}`, convId: id, channel: linkedin ? "linkedin" : "email", direction: "in", source: "external", threadId: `${id}_t`, userId: data.me, from: person, to: [], cc: [], subject: linkedin ? undefined : "Free trial?", body, sentAt: now };
      setData((d) => ({ ...d, convs: [...d.convs, conv], msgs: [...d.msgs, msg] }));
      void classify(id, body);
      notify(person.name, body, hasFeature(lot, "all_messages") ? "Not a contact yet" : "Not logged in production (no contact match)");
      return id;
    }

    const conv = getConv(input.convId ?? selectedId ?? "");
    if (!conv) { toast({ type: "warning", title: "Select a conversation first" }); return; }
    const msgs = ctxMsgs(conv.id);
    const lastOut = [...msgs].reverse().find((m) => m.direction === "out");
    const channel = input.channel ?? lastOut?.channel ?? "email";
    const meT = team.find((t) => t.id === conv.ownerId)!;
    const ooo = input.kind === "ooo";
    const ccPerson: Person | undefined = input.kind === "cc_reply" ? (conv.participants[0] ?? { contactId: null, name: "Priya Shah", email: `priya.shah@${conv.person.companyDomain ?? "example.com"}`, jobTitle: "IT Lead", companyName: conv.person.companyName }) : undefined;
    const from = ccPerson ?? conv.person;
    const body = input.body ?? (ooo
      ? `Thanks for your message. I'm out of the office until ${new Date(inDays(3)).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} with limited access to email.`
      : input.kind === "cc_reply"
        ? `Hi Alice, ${conv.person.name.split(" ")[0]} forwarded me your note. I handle our tooling, can we set up a call next week?`
        : channel === "email" ? "Thanks for following up. Can we do a quick call on Thursday?" : "Sounds good, send me a time 👍");
    const msg: Message = {
      id: uid("msg_sim"), convId: conv.id, channel, direction: "in", source: lastOut?.source === "external" ? "external" : "campaign",
      threadId: lastOut?.threadId ?? `${conv.id}_t1`, userId: conv.ownerId, from, to: [{ contactId: null, name: meT.name, email: meT.email }], cc: ccPerson ? [conv.person] : [],
      subject: channel === "email" ? (lastOut?.subject?.startsWith("Re:") ? lastOut.subject : `Re: ${lastOut?.subject ?? "Quick question"}`) : undefined,
      body, sentAt: now, campaignId: lastOut?.campaignId,
      autoReply: ooo ? { kind: "ooo", backOn: inDays(3) } : undefined,
    };

    setData((d) => ({
      ...d,
      msgs: [...d.msgs, msg],
      convs: d.convs.map((c) => {
        if (c.id !== conv.id) return c;
        const next: Conversation = { ...c, readBy: [] };
        if (ccPerson && hasFeature(d.lot, "participants") && !c.participants.some((p) => p.email === ccPerson.email)) next.participants = [...c.participants, ccPerson];
        if (ooo) {
          if (hasFeature(d.lot, "ooo_visible")) { next.status = "snoozed"; next.snoozeUntil = inDays(3); }
          // Prod: OOO changes nothing on the row (no unread, no sort, no wake).
          else next.readBy = c.readBy;
          return next;
        }
        // Prod: a reply wakes a snooze only for the sender's entry; lot 1 wakes it for everyone.
        const wakes = c.status !== "snoozed" || hasFeature(d.lot, "snooze_wake");
        if (wakes) { next.status = "open"; next.snoozeUntil = undefined; }
        if (c.status === "done") next.status = "open";
        return next;
      }),
    }));
    if (!ooo) void classify(conv.id, body);
    if (ooo) toast({ type: "info", title: "Out of office detected", subtitle: hasFeature(lot, "ooo_visible") ? "Snoozed until they're back. It wakes up if they reply." : "Production: not shown in the list." });
    else notify(from.name, body, conv.status === "snoozed" ? (hasFeature(lot, "snooze_wake") ? "Back from snooze" : "Production: stays snoozed") : undefined);
    return conv.id;
  };

  const ctxMsgs = (convId: string) => data.msgs.filter((m) => m.convId === convId).sort((a, b) => a.sentAt.localeCompare(b.sentAt));

  const notify = (name: string, body: string, subtitle?: string) => {
    toast({ type: "info", title: `New message from ${name}`, subtitle: subtitle ?? body.slice(0, 80) });
    if (data.desktopNotifs && "Notification" in window && Notification.permission === "granted") {
      new Notification(`${name} · lemlist`, { body: body.slice(0, 120) });
    }
  };

  // ─── Proto settings ───────────────────────────────────────────────────────────
  const setLot = (lot: number) => {
    setData((d) => ({ ...d, lot }));
    // Lots 0–2 use the production dropdown views, lot 3+ the new navigation.
    setScope((sc) => {
      const lot3 = hasFeature(lot, "left_nav");
      const map: Partial<Record<ViewId, ViewId>> = lot3
        ? { mine: "inbox", archived: "done", sent: "waiting", untracked: "inbox" }
        : { inbox: "mine", to_classify: "mine", waiting: "sent", done: "archived", unknown: "mine" };
      return { ...sc, view: map[sc.view] ?? sc.view, ...(lot3 ? {} : { channel: null, label: null }) };
    });
  };
  const setMe = (me: string) => { setData((d) => ({ ...d, me })); setScope({ view: hasFeature(data.lot, "left_nav") ? "inbox" : "mine", channel: null, teammate: null, label: null }); };
  const setTheme = (theme: "light" | "dark") => setData((d) => ({ ...d, theme }));
  const setPanelOpen = (panelOpen: boolean) => setData((d) => ({ ...d, panelOpen }));
  const setDesktopNotifs = async (on: boolean) => {
    if (on && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    setData((d) => ({ ...d, desktopNotifs: on }));
  };
  const reset = () => {
    const s = seed();
    setData((d) => ({ ...s, lot: d.lot, theme: d.theme }));
    setSelectedId("cv_marc");
    setScope({ view: hasFeature(data.lot, "left_nav") ? "inbox" : "mine", channel: null, teammate: null, label: null });
    setFilters({});
    toast({ type: "success", title: "Proto data reset" });
  };

  return {
    ...data, ctx, has, scope, setScope, filters, setFilters, search, setSearch,
    selectedId, select, checked, setChecked, commandsOpen, setCommandsOpen, toasts, toast, dismissToast,
    markRead, toggleFavorite, snooze, unsnooze, markDone, reopen, setInterest, toggleLabel, addNote, saveDraft, send,
    addAsContact, ignoreUnknown, neverLog, addParticipantAsContact, simulate,
    setLot, setMe, setTheme, setPanelOpen, setDesktopNotifs, reset,
  };
}

export type InboxStore = ReturnType<typeof useInboxState>;
const InboxContext = createContext<InboxStore | null>(null);

export function InboxProvider({ children }: { children: ReactNode }) {
  const store = useInboxState();
  return <InboxContext.Provider value={store}>{children}</InboxContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInbox(): InboxStore {
  const s = useContext(InboxContext);
  if (!s) throw new Error("useInbox outside InboxProvider");
  return s;
}
