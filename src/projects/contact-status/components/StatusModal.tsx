// Create / edit a contact status (Figma « Create contact status »): name + one of 15 colors.
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button, TextInput, InputLabel, cn } from "@l3mpire/ui";
import { COLORS, type ContactStatus } from "../data";
import { Dot } from "./shared";

export function StatusModal({ open, onOpenChange, initial, existing, onSubmit }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ContactStatus | null;
  existing: ContactStatus[];
  onSubmit: (v: { name: string; color: ContactStatus["color"] }) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<ContactStatus["color"]>("neutral");
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setName(initial?.name ?? ""); setColor(initial?.color ?? "neutral"); }
  }

  const trimmed = name.trim();
  const taken = existing.some((s) => s.id !== initial?.id && s.name.toLowerCase() === trimmed.toLowerCase());
  const submit = () => { if (trimmed && !taken) { onSubmit({ name: trimmed, color }); onOpenChange(false); } };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader onClose={() => onOpenChange(false)}>
          <ModalTitle>{initial ? "Edit contact status" : "Create contact status"}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-xl">
            <TextInput
              label="Status name"
              placeholder="Enter status name..."
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              error={taken}
              errorMessage={taken ? "A status already has this name." : undefined}
            />
            <div className="flex flex-col gap-xs">
              <InputLabel>Status color</InputLabel>
              <div className="flex flex-wrap gap-sm">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "flex size-[24px] items-center justify-center rounded-full border",
                      c === color ? "border-[var(--core-border-main-selected)] ring-1 ring-[var(--core-border-main-selected)]" : "border-transparent",
                    )}
                    style={{ background: `var(--comp-badge-${c}-bg)` }}
                  >
                    <Dot color={c} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button appearance="ghost" intent="brand" size="md" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button appearance="solid" intent="brand" size="md" disabled={!trimmed || taken} onClick={submit}>{initial ? "Save" : "Create"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
