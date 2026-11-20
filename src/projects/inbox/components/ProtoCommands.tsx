// Hidden proto commands, for the PM, devs and designers (not part of the product).
// Open: ⌘⇧K / Ctrl+Shift+K, or `?proto` in the URL. Also exposed on `window.proto` in the console.
import { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Switch, Badge, Avatar, getAvatarTone, cn } from "@l3mpire/ui";
import { useInbox } from "../store";
import { LOTS } from "../lots";
import { SCENARIOS, team } from "../data";
import { kbd } from "./meta";

export function ProtoCommands() {
  const s = useInbox();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("proto")) s.setCommandsOpen(true);
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

  const open = s.commandsOpen;
  const close = () => s.setCommandsOpen(false);
  const run = (fn: () => unknown) => () => { fn(); };

  return (
    <Modal open={open} onOpenChange={s.setCommandsOpen}>
      <ModalContent size="md">
        <ModalHeader onClose={close}>
          <ModalTitle>Proto commands</ModalTitle>
          <ModalDescription>Hidden from users. <span className={kbd}>⌘</span> <span className={kbd}>⇧</span> <span className={kbd}>K</span> to toggle · <code>window.proto.help()</code> in the console · <code>?lot=3</code> in the URL.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <Group title="Delivery lot" hint="Cumulative. Lot 0 approximates production today, with its bugs.">
              <div className="grid grid-cols-2 gap-xs">
                {LOTS.map((l) => (
                  <Button key={l.lot} appearance={s.lot === l.lot ? "solid" : "outlined"} intent="brand" size="sm" className="justify-start" onClick={() => s.setLot(l.lot)}>
                    {l.title}
                  </Button>
                ))}
              </div>
            </Group>

            <Group title="Simulate incoming" hint="Applies to the open conversation unless stated. Watch the list: order, unread, snooze, AI.">
              <div className="flex flex-wrap gap-xs">
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "reply" }))}>Reply</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "reply", body: "Not interested, please remove me from your list." }))}>Negative reply</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "reply", body: "Merci, je reviens vers vous après le comité de jeudi." }))}>Ambiguous FR reply</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "ooo" }))}>Out of office</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "cc_reply" }))}>Reply from CC / colleague</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "reply", channel: "linkedin" }))}>LinkedIn reply</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.simulate({ kind: "reply", channel: "whatsapp" }))}>WhatsApp reply</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.select(s.simulate({ kind: "unknown_linkedin" }) ?? null))}>Inbound LinkedIn · not a contact</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => s.select(s.simulate({ kind: "unknown_email" }) ?? null))}>Inbound email · not a contact</Button>
                <Button appearance="outlined" intent="brand" size="sm" onClick={run(() => { s.select("cv_anna"); setTimeout(() => s.simulate({ kind: "reply", convId: "cv_anna", body: "Hallo Alice, ich bin zurück. Passt Donnerstag um 10 Uhr?" }), 50); })}>Snoozed conversation gets a reply</Button>
              </div>
            </Group>

            <Group title="Signed in as" hint="See team unread, privacy and ownership from another seat.">
              <div className="flex flex-wrap gap-xs">
                {team.map((t) => (
                  <Button key={t.id} appearance={s.me === t.id ? "solid" : "outlined"} intent="brand" size="sm" onClick={() => s.setMe(t.id)}>
                    <span className="inline-flex items-center gap-xs"><Avatar size="sm" initials={t.initials} tone={getAvatarTone(t.id)} />{t.firstName} · {t.role}</span>
                  </Button>
                ))}
              </div>
            </Group>

            <Group title="Jump to a scenario" hint="Each one maps to a theme of the user feedback.">
              <div className="grid grid-cols-2 gap-xs">
                {SCENARIOS.map((sc) => (
                  <button key={sc.id} type="button" onClick={() => { s.setMe(sc.id === "cv_sam_private" ? "usr_alice" : s.me); s.setScope({ view: s.has("left_nav") ? "team" : "mine", channel: null, teammate: null, label: null }); s.select(sc.id); close(); }}
                    className={cn("flex items-center justify-between gap-base rounded-base border border-[var(--core-border-main-subtle)] px-md py-sm text-left text-sm leading-sm text-[var(--core-text-main-primary)] hover:bg-[var(--core-bg-main-hover)]", s.selectedId === sc.id && "border-[var(--core-border-main-selected)]")}>
                    <span>{sc.label}</span>
                    <Badge type="neutral" size="sm">{sc.theme}</Badge>
                  </button>
                ))}
              </div>
            </Group>

            <Group title="Display">
              <div className="flex flex-col gap-base">
                <Switch label="Dark mode" checked={s.theme === "dark"} onCheckedChange={(v) => s.setTheme(v ? "dark" : "light")} />
                <Switch label="Desktop notifications (asks the browser)" checked={s.desktopNotifs} onCheckedChange={(v) => void s.setDesktopNotifs(v)} />
                <Switch label="Contact panel" checked={s.panelOpen} onCheckedChange={s.setPanelOpen} />
              </div>
            </Group>
          </div>
        </ModalBody>
        <ModalFooter infoMessage={`${s.convs.length} conversations · ${s.msgs.length} messages · saved in this browser`}>
          <Button appearance="outlined" intent="alert" size="md" onClick={s.reset}>Reset data</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={close}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-base">
      <div className="flex flex-col">
        <h3 className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">{title}</h3>
        {hint && <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
