// Hidden proto commands (⌘⇧K or ?proto): new signals only, tracking script, deliver signals, dark mode, reset.
import { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Switch } from "@l3mpire/ui";
import { useSig } from "../store";
import { NEW_IDS, signalType } from "../data";

export function ProtoCommands() {
  const s = useSig();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.has("proto")) s.setCommandsOpen(true);
    const t = q.get("signal");
    if (t && NEW_IDS.includes(t)) { s.openWizard(); setTimeout(() => s.pickType(t), 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.deploy(type)": NEW_IDS.join(" | "),
        "proto.deliver()": "New signals for every live agent",
        "proto.tracking(on)": "Website tracking script installed or not",
        "proto.dark(on)": "Dark mode",
        "proto.reset()": "Back to the seed data",
      }),
      deploy: (type: string) => { s.openWizard(); setTimeout(() => s.pickType(type), 0); },
      deliver: () => s.deliverSignals(),
      tracking: (on = true) => s.setTracking(on),
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
          <ModalDescription>Hidden from users. ⌘ ⇧ K to toggle · <code>window.proto.help()</code> · <code>?signal=aiAdoption</code> opens the wizard on a signal.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Signal picker</span>
              <Switch label="Show only the 11 new signals" checked={s.newOnly} onCheckedChange={s.setNewOnly} />
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Ads engagement</span>
              <Switch label="Tracking script installed on lemlist.com" checked={s.trackingInstalled} onCheckedChange={s.setTracking} />
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Open the wizard on a new signal</span>
              <div className="flex flex-wrap gap-xs">
                {NEW_IDS.map((id) => (
                  <Button key={id} appearance="outlined" intent="brand" size="xs" onClick={() => { close(); s.openWizard(); setTimeout(() => s.pickType(id), 0); }}>{signalType(id).shortTitle}</Button>
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Display</span>
              <Switch label="Dark mode" checked={s.theme === "dark"} onCheckedChange={(v) => s.setTheme(v ? "dark" : "light")} />
            </section>
          </div>
        </ModalBody>
        <ModalFooter infoMessage="Saved in this browser">
          <Button appearance="outlined" intent="alert" size="md" onClick={s.reset}>Reset data</Button>
          <Button appearance="outlined" intent="brand" size="md" onClick={() => { close(); s.deliverSignals(); }}>Deliver signals now</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={close}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
