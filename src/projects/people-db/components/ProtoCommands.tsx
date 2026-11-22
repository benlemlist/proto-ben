// Hidden proto commands (⌘⇧K or ?proto): company profile, first open (lazy generation), today's signals, empty signals, panel, dark mode, reset.
import { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Switch } from "@l3mpire/ui";
import { usePdb } from "../store";
import { PROFILES } from "../data";

export function ProtoCommands() {
  const s = usePdb();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("proto")) s.setCommandsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.profile(id)": PROFILES.map((p) => p.id).join(" | "),
        "proto.firstOpen()": "First PeopleDB open of an existing account (lists generated)",
        "proto.fresh()": "Deliver today's signal list",
        "proto.noSignals(on)": "No fresh signal in the ICP",
        "proto.agent(on)": "lemAgent panel",
        "proto.dark(on)": "Dark mode",
        "proto.reset()": "Back to the seed data",
      }),
      profile: s.setProfile,
      firstOpen: s.firstOpen,
      fresh: s.deliverFresh,
      noSignals: (on = true) => s.setSignalsEmpty(on),
      agent: (on = true) => s.setAgentPanel(on),
      dark: (on = true) => s.setTheme(on ? "dark" : "light"),
      reset: s.reset,
    };
  });

  const close = () => s.setCommandsOpen(false);

  return (
    <Modal open={s.commandsOpen} onOpenChange={s.setCommandsOpen}>
      <ModalContent size="sm">
        <ModalHeader onClose={close}>
          <ModalTitle>Proto commands</ModalTitle>
          <ModalDescription>Hidden from users. ⌘ ⇧ K to toggle · <code>window.proto.help()</code> · <code>?list=…</code> opens a list.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Company profile</span>
              <div className="flex flex-wrap gap-xs">
                {PROFILES.map((p) => (
                  <Button key={p.id} appearance={s.profileId === p.id ? "solid" : "outlined"} intent="brand" size="xs" onClick={() => { close(); s.setProfile(p.id); }}>
                    {p.company} · {p.pitch.split(" for ")[0]}
                  </Button>
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Scenarios</span>
              <div className="flex flex-wrap gap-xs">
                <Button appearance="outlined" intent="brand" size="xs" onClick={() => { close(); s.firstOpen(); }}>First open (lists generating)</Button>
                <Button appearance="outlined" intent="brand" size="xs" onClick={() => { close(); s.deliverFresh(); }}>Next morning: new signals</Button>
              </div>
              <Switch label="No fresh signal today" checked={s.signalsEmpty} onCheckedChange={s.setSignalsEmpty} />
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Display</span>
              <Switch label="lemAgent panel" checked={s.agentPanel} onCheckedChange={s.setAgentPanel} />
              <Switch label="Dark mode" checked={s.theme === "dark"} onCheckedChange={(v) => s.setTheme(v ? "dark" : "light")} />
            </section>
          </div>
        </ModalBody>
        <ModalFooter infoMessage="Saved in this browser">
          <Button appearance="outlined" intent="alert" size="md" onClick={() => { s.reset(); close(); }}>Reset data</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={close}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
