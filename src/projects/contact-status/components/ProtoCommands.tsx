// Hidden proto commands (⌘⇧K or ?proto): scenarios, simulator, dark mode, reset. Not part of the product.
import { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Switch, cn } from "@l3mpire/ui";
import { useCS } from "../store";
import { SCENARIOS } from "../data";

export function ProtoCommands() {
  const s = useCS();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.has("proto")) s.setCommandsOpen(true);
    const sc = q.get("scenario");
    if (sc && SCENARIOS.some((x) => x.id === sc)) s.loadScenario(sc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.scenario(id)": SCENARIOS.map((x) => x.id).join(" | "),
        "proto.try()": "Open the contact simulator",
        "proto.reset()": "Reset the current scenario",
        "proto.dark(on)": "Dark mode",
        "proto.state()": "Saved and draft config",
      }),
      scenario: s.loadScenario,
      try: () => s.setSimOpen(true),
      reset: s.reset,
      dark: (on = true) => s.setTheme(on ? "dark" : "light"),
      state: () => ({ saved: s.saved, draft: s.draft, dirty: s.dirty }),
    };
  });

  const close = () => s.setCommandsOpen(false);

  return (
    <Modal open={s.commandsOpen} onOpenChange={s.setCommandsOpen}>
      <ModalContent size="sm">
        <ModalHeader onClose={close}>
          <ModalTitle>Proto commands</ModalTitle>
          <ModalDescription>Hidden from users. ⌘ ⇧ K to toggle · <code>window.proto.help()</code> · <code>?scenario=hubspot</code> in the URL.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">Team</span>
              <div className="flex flex-col gap-xs">
                {SCENARIOS.map((sc) => (
                  <button key={sc.id} type="button" onClick={() => { s.loadScenario(sc.id); close(); }}
                    className={cn("flex items-center justify-between gap-base rounded-base border border-[var(--core-border-main-subtle)] px-md py-sm text-left hover:bg-[var(--core-bg-main-hover)]", s.scenario === sc.id && "border-[var(--core-border-main-selected)]")}>
                    <span className="text-base leading-base text-[var(--core-text-main-primary)]">{sc.label}</span>
                    <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{sc.hint}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">Display</span>
              <Switch label="Dark mode" checked={s.theme === "dark"} onCheckedChange={(v) => s.setTheme(v ? "dark" : "light")} />
            </section>
          </div>
        </ModalBody>
        <ModalFooter infoMessage="Saved in this browser">
          <Button appearance="outlined" intent="alert" size="md" onClick={s.reset}>Reset data</Button>
          <Button appearance="outlined" intent="brand" size="md" onClick={() => { close(); s.setSimOpen(true); }}>Try on a contact</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={close}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
