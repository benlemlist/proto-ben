// "Sync contact statuses with HubSpot" (Figma): pull a CRM picklist as lemlist's contact status values.
// The mapping lead status → contact status keeps working on top of the synced values.
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Select, DropdownMenu, DropdownMenuList, DropdownMenuItem, InfoMessage } from "@l3mpire/ui";
import { useCS } from "../store";
import { CRM_FIELDS, SCENARIOS } from "../data";

export function SyncCrmModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const s = useCS();
  const [fieldId, setFieldId] = useState(CRM_FIELDS[0].id);
  const [selOpen, setSelOpen] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) { setPrevOpen(open); if (open) setFieldId(s.draft.crmFieldId ?? CRM_FIELDS[0].id); }
  const field = CRM_FIELDS.find((f) => f.id === fieldId)!;
  const synced = !!s.draft.crmFieldId;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader onClose={() => onOpenChange(false)}>
          <ModalTitle>Sync contact statuses with HubSpot</ModalTitle>
          <ModalDescription>Pull statuses from your CRM to use them within lemlist.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-xl">
            <Select label="Field to map with" value={`${field.label} (${field.statuses.length} values)`} isOpen={selOpen} onOpenChange={setSelOpen}>
              <DropdownMenu className="w-[440px]">
                <DropdownMenuList>
                  {CRM_FIELDS.map((f) => (
                    <DropdownMenuItem key={f.id} label={f.label} sublabel={`${f.statuses.length} values`} description={f.statuses.map((x) => x.name).join(", ")} selected={f.id === fieldId} onClick={() => { setFieldId(f.id); setSelOpen(false); }} />
                  ))}
                </DropdownMenuList>
              </DropdownMenu>
            </Select>
            <InfoMessage type="info" description="Only HubSpot picklists are listed: a contact status can only be matched value by value against a closed list." />
            <InfoMessage type="warning" description="Your current statuses are replaced by these values. We place them in the lifecycle and map events again, you review it before saving." />
          </div>
        </ModalBody>
        <ModalFooter>
          {synced && (
            <Button appearance="ghost" intent="alert" size="md" className="mr-auto" onClick={() => {
              const base = SCENARIOS[0].config();
              s.setDraft((c) => ({ ...c, crmFieldId: null, statuses: base.statuses, mapping: base.mapping }));
              onOpenChange(false);
            }}>Stop syncing</Button>
          )}
          <Button appearance="ghost" intent="brand" size="md" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={() => {
            s.setDraft((c) => ({ ...c, crmFieldId: field.id, statuses: structuredClone(field.statuses), mapping: { ...c.mapping, ...field.mapping }, enabled: true }));
            s.toast({ type: "success", title: `${field.statuses.length} statuses pulled from HubSpot`, subtitle: "Review the lifecycle and the events, then save." });
            onOpenChange(false);
          }}>Continue</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
