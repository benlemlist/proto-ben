// Save a new mapping (grooming 28/09): 1. only from now on, 2. recalculate existing contacts,
// 3. recalculate and push to the CRM (sensitive for Salesforce / Pipedrive: their workflows fire).
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, RadioCardGroup, RadioCard, InfoMessage } from "@l3mpire/ui";
import { faArrowRightOutline, faClockRotateLeftOutline, faCopyOutline } from "@l3mpire/icons";
import { useCS } from "../store";
import { CONTACT_COUNT } from "../data";

const fmt = (n: number) => n.toLocaleString("en-US");

export function SaveModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const s = useCS();
  const [mode, setMode] = useState("forward");
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) { setPrevOpen(open); if (open) setMode("forward"); }
  const turningOn = s.draft.enabled && !s.saved.enabled;
  const turningOff = !s.draft.enabled && s.saved.enabled;
  const affected = Math.round(CONTACT_COUNT * 0.38);

  const confirm = () => {
    s.save();
    onOpenChange(false);
    if (turningOff) s.toast({ type: "success", title: "Contact status no longer moves with lead status", subtitle: "Current statuses stay as they are." });
    else if (mode === "forward") s.toast({ type: "success", title: "Mapping saved", subtitle: "It applies to the next events. Existing contacts keep their status." });
    else s.toast({ type: "info", title: `Recalculating ${fmt(CONTACT_COUNT)} contacts…`, subtitle: mode === "push" ? "About 3 minutes. HubSpot receives the changes as they come." : "About 3 minutes. Each change shows in the contact's status history." });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader onClose={() => onOpenChange(false)}>
          <ModalTitle>{turningOff ? "Stop moving contact status?" : turningOn ? "Turn on dynamic contact status" : "Save the new mapping"}</ModalTitle>
          {!turningOff && <ModalDescription>What should happen to the {fmt(CONTACT_COUNT)} contacts you already have?</ModalDescription>}
        </ModalHeader>
        <ModalBody>
          {turningOff ? (
            <InfoMessage type="info" description="Contacts keep the status they have now. From now on, only a person, a CSV import, the API or your CRM changes it." />
          ) : (
            <div className="flex flex-col gap-xl">
              <RadioCardGroup orientation="vertical" value={mode} onValueChange={setMode}>
                <RadioCard value="forward" icon={faArrowRightOutline} title="Only from now on" description="Existing contacts keep their status. The next events follow the new mapping." />
                <RadioCard value="recalc" icon={faClockRotateLeftOutline} title="Recalculate existing contacts" description={`We replay each contact's latest campaign. About ${fmt(affected)} statuses change, each one logged in its history.`} />
                <RadioCard value="push" icon={faCopyOutline} title="Recalculate and update HubSpot" description={`Same, then HubSpot receives about ${fmt(affected)} updates.`} disabled={!s.draft.crmFieldId}>
                  <InfoMessage type="warning" description="HubSpot workflows that watch this field will fire for each updated contact." />
                </RadioCard>
              </RadioCardGroup>
              {!s.draft.crmFieldId && <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Updating your CRM needs the contact status synced with it.</span>}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button appearance="ghost" intent="brand" size="md" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button appearance="solid" intent={turningOff ? "alert" : "brand"} size="md" onClick={confirm}>{turningOff ? "Stop" : mode === "forward" ? "Save" : "Save and recalculate"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
