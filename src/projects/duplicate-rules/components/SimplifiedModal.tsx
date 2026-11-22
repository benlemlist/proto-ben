// Simplified duplicate rules: per object, the key that always matches, then at most one choice + one "also match".
// - The two mutually exclusive company toggles (clean name / domain only) become one radio: "Same domain" vs "Same domain and name".
//   The name is always cleaned when it counts (no "uncleaned" state: open question for Edouard).
// - "Allow LinkedIn duplicates" (negative) becomes "Also match on LinkedIn" (positive). LinkedIn + Sales Navigator are one criterion.
// - One example block per object, rewritten from the current choices.
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, InputGroup, InputGroupItem } from "@l3mpire/ui";
import { Icon, faUsersOutline, faBuildingsOutline, faCircleInfoOutline, faLinkedinBrand } from "@l3mpire/icons";
import { type Rules, type CompanyMatch, normalizeForSimplified, contactExample, companyExamples, keepProtoPanel } from "../rules";

export function SimplifiedModal({ open, rules, onClose, onSave }: { open: boolean; rules: Rules; onClose: () => void; onSave: (r: Rules) => void }) {
  const [draft, setDraft] = useState(() => normalizeForSimplified(rules));
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) { setPrevOpen(open); if (open) setDraft(normalizeForSimplified(rules)); }
  const set = (patch: Partial<Rules>) => setDraft((d) => normalizeForSimplified({ ...d, ...patch }));

  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent size="md" onInteractOutside={keepProtoPanel}>
        <ModalHeader onClose={onClose}>
          <ModalTitle>Duplicate rules</ModalTitle>
          <ModalDescription>When a new record matches an existing one, lemlist updates it instead of creating a duplicate.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <Section icon={faUsersOutline} title="Contacts" lead="Contacts with the same email are always the same contact." examples={[contactExample(draft)]}>
              <InputGroup control="checkbox" variant="card">
                <InputGroupItem
                  icon={faLinkedinBrand}
                  title="Also match on LinkedIn profile"
                  description="Same LinkedIn or Sales Navigator URL, even with a different email."
                  checked={draft.contactLinkedin}
                  onCheckedChange={(v) => set({ contactLinkedin: v })}
                />
              </InputGroup>
            </Section>

            <Section icon={faBuildingsOutline} title="Companies" lead="Two companies are the same when they have…" examples={companyExamples(draft)}>
              <InputGroup control="radio" variant="card" value={draft.companyMatch} onValueChange={(v) => set({ companyMatch: v as CompanyMatch })}>
                <InputGroupItem value="domain" title="The same domain" description="Their names don't matter." />
                <InputGroupItem value="domain_name" title="The same domain and name" description="Legal suffixes and typos are ignored. Subsidiaries stay separate." />
              </InputGroup>
              <InputGroup control="checkbox" variant="card">
                <InputGroupItem
                  icon={faLinkedinBrand}
                  title="Also match on LinkedIn page"
                  description="Same LinkedIn or Sales Navigator URL, whatever their domain."
                  checked={draft.companyLinkedin}
                  onCheckedChange={(v) => set({ companyLinkedin: v })}
                />
              </InputGroup>
            </Section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button appearance="ghost" intent="brand" size="md" onClick={onClose}>Cancel</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={() => onSave(draft)}>Save rules</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function Section({ icon, title, lead, examples, children }: { icon: React.ComponentProps<typeof Icon>["icon"]; title: string; lead: string; examples: string[]; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-col gap-2xs">
        <h3 className="flex items-center gap-xs text-base leading-base font-semibold text-[var(--core-text-main-primary)]">
          <Icon icon={icon} size="xs" />{title}
        </h3>
        <p className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{lead}</p>
      </div>
      {children}
      <div className="flex gap-base rounded-base bg-[var(--core-bg-main-secondary)] px-lg py-md text-sm leading-sm text-[var(--core-text-main-secondary)]">
        <span className="shrink-0 text-[var(--core-text-main-tertiary)]"><Icon icon={faCircleInfoOutline} size="xs" /></span>
        <ul className="flex flex-col gap-xs">
          {examples.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>
    </section>
  );
}
