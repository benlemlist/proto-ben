// Proto controls of Inbox, in the floating proto panel (⌘⇧K), for the PM, devs and designers (not part of the product).
// Also `window.proto` in the console and `?lot=3` in the URL.
import { useEffect } from "react";
import { ProtoPanelSection, ProtoGroup, ProtoChoice, ProtoToggle, ProtoAction } from "../../../lib/proto-panel";
import { faBoltOutline } from "@l3mpire/icons";
import { useInbox } from "../store";
import { LOTS } from "../lots";
import { SCENARIOS, team } from "../data";

export function ProtoCommands() {
  const s = useInbox();

  useEffect(() => {
    const lotParam = new URLSearchParams(window.location.search).get("lot");
    if (lotParam !== null && !Number.isNaN(Number(lotParam))) s.setLot(Number(lotParam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // window.proto — console API
  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.lot(n)": "Show delivery lot n (0 = production today, 6 = full vision)",
        "proto.reply(convId?)": "Simulate a reply on the selected (or given) conversation",
        "proto.ooo(convId?)": "Simulate an out-of-office reply",
        "proto.ccReply(convId?)": "Simulate a reply from someone in CC / a colleague",
        "proto.unknown('linkedin'|'email')": "Simulate an inbound message from someone who is not a contact",
        "proto.as(userId)": "Sign in as a teammate (usr_alice, usr_thomas, usr_lucas, usr_emma, usr_chloe, usr_jules)",
        "proto.open(convId)": "Open a conversation",
        "proto.reset()": "Reset the data",
        "proto.dark(on)": "Dark mode",
      }),
      lot: s.setLot,
      reply: (convId?: string) => s.simulate({ kind: "reply", convId }),
      ooo: (convId?: string) => s.simulate({ kind: "ooo", convId }),
      ccReply: (convId?: string) => s.simulate({ kind: "cc_reply", convId }),
      unknown: (ch: "linkedin" | "email" = "linkedin") => s.simulate({ kind: ch === "linkedin" ? "unknown_linkedin" : "unknown_email" }),
      as: s.setMe,
      open: s.select,
      reset: s.reset,
      dark: (on = true) => s.setTheme(on ? "dark" : "light"),
      state: () => ({ lot: s.lot, me: s.me, conversations: s.convs.length, messages: s.msgs.length }),
    };
  });

  const reply = (body?: string, channel?: "linkedin" | "whatsapp") => () => s.simulate({ kind: "reply", body, channel });
  const jump = (id: string) => {
    s.setMe(id === "cv_sam_private" ? "usr_alice" : s.me);
    s.setScope({ view: s.has("left_nav") ? "team" : "mine", channel: null, teammate: null, label: null });
    s.select(id);
  };

  return (
    <ProtoPanelSection title="Inbox" onReset={s.reset}>
      <ProtoGroup label="Delivery lot" hint="Cumulative: a lot includes the ones before. Prod approximates production today, with its bugs.">
        <ProtoChoice value={String(s.lot)} onChange={(v) => s.setLot(Number(v))} options={LOTS.map((l) => ({ value: String(l.lot), label: LOT_LABEL[l.lot] ?? l.title }))} />
      </ProtoGroup>
      <ProtoGroup label="Simulate incoming" hint="On the open conversation unless stated.">
        <ProtoAction icon={faBoltOutline} onClick={reply()}>Reply</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={reply("Not interested, please remove me from your list.")}>Negative reply</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={reply("Merci, je reviens vers vous après le comité de jeudi.")}>Ambiguous FR reply</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={() => s.simulate({ kind: "ooo" })}>Out of office</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={() => s.simulate({ kind: "cc_reply" })}>Reply from CC / colleague</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={reply(undefined, "linkedin")}>LinkedIn reply</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={reply(undefined, "whatsapp")}>WhatsApp reply</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={() => s.select(s.simulate({ kind: "unknown_linkedin" }) ?? null)}>Inbound LinkedIn · not a contact</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={() => s.select(s.simulate({ kind: "unknown_email" }) ?? null)}>Inbound email · not a contact</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={() => { s.select("cv_anna"); setTimeout(() => s.simulate({ kind: "reply", convId: "cv_anna", body: "Hallo Alice, ich bin zurück. Passt Donnerstag um 10 Uhr?" }), 50); }}>Snoozed conversation gets a reply</ProtoAction>
      </ProtoGroup>
      <ProtoGroup label="Signed in as" hint="See team unread, privacy and ownership from another seat.">
        <ProtoChoice value={s.me} onChange={s.setMe} options={team.map((t) => ({ value: t.id, label: `${t.firstName} · ${t.role}` }))} />
      </ProtoGroup>
      <ProtoGroup label="Jump to a scenario" hint="Each one maps to a theme of the user feedback.">
        {SCENARIOS.map((sc) => <ProtoAction key={sc.id} onClick={() => jump(sc.id)}>{sc.label} · {sc.theme}</ProtoAction>)}
      </ProtoGroup>
      <ProtoGroup label="Display">
        <ProtoToggle label="Dark mode" checked={s.theme === "dark"} onChange={(v) => s.setTheme(v ? "dark" : "light")} />
        <ProtoToggle label="Desktop notifications (asks the browser)" checked={s.desktopNotifs} onChange={(v) => void s.setDesktopNotifs(v)} />
        <ProtoToggle label="Contact panel" checked={s.panelOpen} onChange={s.setPanelOpen} />
      </ProtoGroup>
    </ProtoPanelSection>
  );
}

const LOT_LABEL: Record<number, string> = {
  0: "Prod",
  1: "Lot 1 · Trust",
  2: "Lot 2 · Reply without Gmail",
  3: "Lot 3 · Triage",
  4: "Lot 4 · All messages",
  5: "Lot 5 · Team",
  6: "Lot 6 · AI",
};
