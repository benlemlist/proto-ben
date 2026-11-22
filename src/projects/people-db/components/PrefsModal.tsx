// "Manage preferences": the company profile the lists are matched to (read from the context center) and the signals watched.
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Badge, Switch } from "@l3mpire/ui";
import { usePdb } from "../store";
import { PROFILES, SIGNALS, type SignalKind } from "../data";
import { Muted } from "./shared";

export function PrefsModal() {
  const s = usePdb();
  const profile = PROFILES.find((p) => p.id === s.profileId) ?? PROFILES[0];
  const [on, setOn] = useState<Record<SignalKind, boolean>>({ hiring: true, jobChange: true, techAdoption: true, renewal: true });
  const close = () => s.setPrefsOpen(false);

  return (
    <Modal open={s.prefsOpen} onOpenChange={s.setPrefsOpen}>
      <ModalContent size="md">
        <ModalHeader onClose={close}>
          <ModalTitle>List preferences</ModalTitle>
          <ModalDescription>Suggested lists are matched to your company profile. Update it in the context center.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">{profile.company}</span>
              <Muted>{profile.pitch}</Muted>
              <div className="flex flex-wrap gap-xs">
                {profile.icp.map((x) => <Badge key={x} type="neutral" size="sm">{x}</Badge>)}
              </div>
              <div>
                <Button appearance="outlined" intent="brand" size="sm" onClick={() => { close(); s.toast({ type: "info", title: "Context center", subtitle: "Proto: not built here. Lists regenerate when the profile changes." }); }}>
                  Edit in context center
                </Button>
              </div>
            </section>
            <section className="flex flex-col gap-base">
              <span className="text-base leading-base font-semibold">Signals to watch</span>
              {(Object.keys(SIGNALS) as SignalKind[]).map((k) => (
                <Switch key={k} label={SIGNALS[k].label} checked={on[k]} onCheckedChange={(v) => setOn((o) => ({ ...o, [k]: v }))} />
              ))}
            </section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button appearance="outlined" intent="brand" size="md" onClick={close}>Cancel</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={() => { close(); s.toast({ type: "success", title: "Preferences saved", subtitle: "Signal lists update tomorrow morning." }); }}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
