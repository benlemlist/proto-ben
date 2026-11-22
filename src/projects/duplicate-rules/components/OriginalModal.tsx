// Edouard's original "Duplicate rules" modal (artifact), rebuilt in lemDS for comparison. Same wording, same states:
// 4 switches, "Clean name" and "Domain only" exclude each other (the other one is disabled with a tooltip),
// an example under each switch that depends on the combination.
import { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, Button, Badge, InputGroup, InputGroupItem,
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent,
} from "@l3mpire/ui";
import { Icon, faUsersOutline, faBuildingsOutline, faCircleInfoOutline } from "@l3mpire/icons";
import { type Rules, keepProtoPanel } from "../rules";

// Edouard's flags, derived from the shared model.
interface Flags { linkedin: boolean; companyLinkedin: boolean; clean: boolean; domain: boolean }
const toFlags = (r: Rules): Flags => ({ linkedin: !r.contactLinkedin, companyLinkedin: !r.companyLinkedin, clean: r.cleanName && r.companyMatch === "domain_name", domain: r.companyMatch === "domain" });
const toRules = (f: Flags): Rules => ({ contactLinkedin: !f.linkedin, companyLinkedin: !f.companyLinkedin, cleanName: f.clean, companyMatch: f.domain ? "domain" : "domain_name" });

export function OriginalModal({ open, rules, onClose, onSave }: { open: boolean; rules: Rules; onClose: () => void; onSave: (r: Rules) => void }) {
  const [f, setF] = useState(() => toFlags(rules));
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) { setPrevOpen(open); if (open) setF(toFlags(rules)); }
  const set = (patch: Partial<Flags>) => setF((x) => ({ ...x, ...patch }));

  const cleanExample = f.domain ? null : f.clean ? (
    <ul className="flex flex-col gap-xs">
      <li>"lemlist - lemlist.com" exists in lemlist, "lemlist Ltd - lemlist.com" is imported → <b>both are matched.</b></li>
      <li>"lemlist - lemlist.com" exists in lemlist, "lemlist North America - lemlist.com" is imported → <b>a new company is created.</b></li>
    </ul>
  ) : <>"lemlist - lemlist.com" exists in lemlist, "lemlist Ltd - lemlist.com" is imported → <b>a new company is created.</b></>;

  const domainExample = f.domain
    ? <>Company A exists in lemlist with company.com. Company B is added to lemlist with the same domain and <b>updates Company A, no new company is created.</b></>
    : f.clean ? null : <>Company A and Company B, both on company.com, <b>stay two separate companies.</b></>;

  const companyLinkedinExample = !f.companyLinkedin ? null : (
    <ul className="flex flex-col gap-xs">
      <li>"Acme France - acme.fr - /company/acme" exists in lemlist, "Acme Spain - acme.es - /company/acme" is imported → <b>a new company is created.</b></li>
      <li>"Engie France - engie.com - /company/engie" exists in lemlist, "Engie Belgium - engie.com - /company/engie" is imported → {f.domain ? <><b>both are matched</b>, because companies are matched on domain only.</> : <b>a new company is created.</b>}</li>
    </ul>
  );

  return (
    <TooltipProvider>
      <Modal open={open} onOpenChange={(v) => !v && onClose()}>
        <ModalContent size="md" onInteractOutside={keepProtoPanel}>
          <ModalHeader onClose={onClose}>
            <ModalTitle>Duplicate rules</ModalTitle>
            <ModalDescription>When a new record matches an existing one, lemlist updates it instead of creating a duplicate.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2xl">
              <Section icon={faUsersOutline} title="Contacts" matched={["Email", "LinkedIn URL", "Sales Navigator URL"]}>
                <Opt title="Allow LinkedIn and Sales Navigator URL duplicates" description="Two contacts with the same LinkedIn or Sales Navigator URL stay separate when their emails differ."
                  checked={f.linkedin} onChange={(v) => set({ linkedin: v })}
                  example={f.linkedin ? <>Theresa moves from Company A to Company B with the same LinkedIn profile and a new email: <b>she becomes a new contact.</b></> : null} />
              </Section>

              <Section icon={faBuildingsOutline} title="Companies" matched={[f.domain ? "Domain" : "Name + Domain", "LinkedIn URL", "Sales Navigator URL"]}>
                <Opt title="Clean company name to avoid duplicates" description="Company names entering lemlist are stripped of legal suffixes and copy errors to avoid creating duplicates, but legitimate geographic subsidiaries are kept."
                  checked={f.clean && !f.domain} onChange={(v) => set({ clean: v })} example={cleanExample}
                  disabledTip={f.domain ? 'Turn off "Match company only on domain" to use this option. Companies are matched on their domain alone, so their names are ignored and cleaning them changes nothing.' : undefined} />
                <Opt title="Match company only on domain" description="Companies that share a domain are considered as one company, even when their names differ."
                  checked={f.domain} onChange={(v) => set({ domain: v })} example={domainExample}
                  disabledTip={f.clean ? 'Turn off "Clean company name to avoid duplicates" to use this option. Companies would be matched on their domain alone, so their names, cleaned or not, would be ignored.' : undefined} />
                <Opt title="Allow LinkedIn and Sales Navigator URL duplicates" description="Two companies can share the same LinkedIn or Sales Navigator URL: the URL no longer merges them, their name and domain decide."
                  checked={f.companyLinkedin} onChange={(v) => set({ companyLinkedin: v })} example={companyLinkedinExample} />
              </Section>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button appearance="ghost" intent="brand" size="md" onClick={onClose}>Cancel</Button>
            <Button appearance="solid" intent="brand" size="md" onClick={() => onSave(toRules(f))}>Save rules</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TooltipProvider>
  );
}

function Section({ icon, title, matched, children }: { icon: React.ComponentProps<typeof Icon>["icon"]; title: string; matched: string[]; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-md">
      <h3 className="flex items-center gap-xs text-base leading-base font-semibold text-[var(--core-text-main-primary)]"><Icon icon={icon} size="xs" />{title}</h3>
      <div className="flex flex-wrap items-center gap-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]">
        Matched on {matched.map((m) => <Badge key={m} type="info" size="sm">{m}</Badge>)}
      </div>
      <div className="flex flex-col gap-base">{children}</div>
    </section>
  );
}

function Opt({ title, description, checked, onChange, example, disabledTip }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void; example: React.ReactNode; disabledTip?: string;
}) {
  const item = (
    <InputGroup control="switch" variant="card">
      <InputGroupItem title={title} description={description} checked={checked} onCheckedChange={onChange} disabled={!!disabledTip}>
        {example && (
          <div className="mt-xs flex gap-base rounded-base bg-[var(--core-bg-main-secondary)] px-lg py-md text-sm leading-sm text-[var(--core-text-main-secondary)]">
            <span className="shrink-0 text-[var(--core-text-main-tertiary)]"><Icon icon={faCircleInfoOutline} size="xs" /></span>
            <span>{example}</span>
          </div>
        )}
      </InputGroupItem>
    </InputGroup>
  );
  if (!disabledTip) return item;
  return (
    <Tooltip>
      <TooltipTrigger asChild><div className="cursor-not-allowed">{item}</div></TooltipTrigger>
      <TooltipContent side="top" className="max-w-[320px]">{disabledTip}</TooltipContent>
    </Tooltip>
  );
}
