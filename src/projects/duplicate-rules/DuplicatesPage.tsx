// Settings › Data management › Duplicates (PM: Edouard, "Duplicate rules modal").
// The tab shows the rules in plain sentences; "Edit rules" opens the modal.
// Proto panel: switch between Edouard's original modal and the simplified one, and load a team's default rules.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  SidebarSettings, SidebarSection, SidebarHeadingItem, SidebarItem, Tabs, TabList, TabTrigger, Button, Toast, EmptyState,
  RadioGroup, RadioGroupItem,
} from "@l3mpire/ui";
import {
  Icon, faGearOutline, faUsersOutline, faBadgeDollarOutline, faEnvelopeOutline, faAddressBookOutline, faSlidersOutline, faXmarkOutline,
  faBuildingsOutline, faStarsOutline, faPenOutline,
} from "@l3mpire/icons";
import { protoTitle } from "../../lib/proto-identity";
import { ProtoPanelSection } from "../../lib/proto-panel";
import { DEFAULTS, type Rules, type Version, contactSummary, companySummary } from "./rules";
import { SimplifiedModal } from "./components/SimplifiedModal";
import { OriginalModal } from "./components/OriginalModal";

const DM_TABS = ["Enrichment", "Lead scoring", "Duplicates", "Fields update", "Statuses", "Website visitor"];
const TAB_ROUTES: Record<string, string> = { Statuses: "/settings/data-management/statuses" };

export default function DuplicatesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Duplicates");
  const [version, setVersion] = useState<Version>("simplified");
  const [team, setTeam] = useState<"existing" | "new">("existing");
  const [rules, setRules] = useState<Rules>(DEFAULTS.existing);
  const [open, setOpen] = useState(true);
  const [toast, setToast] = useState(false);

  useEffect(() => { document.title = protoTitle("Duplicate rules"); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(false), 4000); return () => clearTimeout(t); }, [toast]);

  const onTab = (t: string) => (TAB_ROUTES[t] ? navigate(TAB_ROUTES[t]) : setTab(t));
  const save = (r: Rules) => { setRules(r); setOpen(false); setToast(true); };
  const loadTeam = (t: "existing" | "new") => { setTeam(t); setRules(DEFAULTS[t]); };
  const Modal = version === "simplified" ? SimplifiedModal : OriginalModal;

  return (
    <div className="relative flex h-full min-h-0 bg-[var(--core-bg-main-primary)]">
      <SidebarSettings>
        <SidebarSection>
          <SidebarHeadingItem label="Team settings" />
          <SidebarItem icon={faGearOutline} label="General" />
          <SidebarItem icon={faUsersOutline} label="Members" />
          <SidebarItem icon={faEnvelopeOutline} label="Senders" />
          <SidebarItem icon={faSlidersOutline} label="Integrations" />
          <SidebarItem icon={faAddressBookOutline} label="Data management" state="active" />
          <SidebarItem icon={faBadgeDollarOutline} label="Plans & billing" />
        </SidebarSection>
      </SidebarSettings>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-[var(--core-border-main-subtle)] pr-lg">
          <Tabs value={tab} onValueChange={onTab} className="flex-1">
            <TabList hasOffset>
              {DM_TABS.map((t) => <TabTrigger key={t} value={t}>{t}</TabTrigger>)}
            </TabList>
          </Tabs>
          <Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faXmarkOutline} aria-label="Close settings" onClick={() => navigate("/contacts")} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab !== "Duplicates" ? (
            <div className="flex h-full items-center justify-center p-4xl">
              <EmptyState icon={faStarsOutline} title={tab} description="Not part of this prototype. Open the Duplicates or Statuses tab." />
            </div>
          ) : (
            <div className="mx-auto flex max-w-[1164px] flex-col gap-xl p-xl">
              <div className="flex items-start justify-between gap-xl rounded-lg border border-[var(--core-border-main-subtle)] px-xl py-lg">
                <div className="flex flex-col gap-lg">
                  <div className="flex flex-col gap-2xs">
                    <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">Duplicate rules</span>
                    <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">When a new record matches an existing one, lemlist updates it instead of creating a duplicate.</span>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] items-center gap-x-xl gap-y-base text-base leading-base">
                    <dt className="flex items-center gap-xs text-[var(--core-text-main-secondary)]"><Icon icon={faUsersOutline} size="xs" />Contacts</dt>
                    <dd className="text-[var(--core-text-main-primary)]">{contactSummary(rules)}</dd>
                    <dt className="flex items-center gap-xs text-[var(--core-text-main-secondary)]"><Icon icon={faBuildingsOutline} size="xs" />Companies</dt>
                    <dd className="text-[var(--core-text-main-primary)]">{companySummary(rules)}</dd>
                  </dl>
                </div>
                <Button appearance="outlined" intent="brand" size="md" leftIcon={faPenOutline} onClick={() => setOpen(true)}>Edit rules</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal key={`${version}-${team}`} open={open} rules={rules} onClose={() => setOpen(false)} onSave={save} />

      <ProtoPanelSection title="Duplicate rules">
        <div className="flex flex-col gap-base">
          <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Modal version</span>
          <RadioGroup value={version} onValueChange={(v) => setVersion(v as Version)}>
            <RadioGroupItem value="simplified" label="Simplified" />
            <RadioGroupItem value="original" label="Original (Edouard)" />
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-base">
          <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Default rules of</span>
          <RadioGroup value={team} onValueChange={(v) => loadTeam(v as "existing" | "new")}>
            <RadioGroupItem value="existing" label="An existing team" />
            <RadioGroupItem value="new" label="A new team" />
          </RadioGroup>
        </div>
        <Button appearance="outlined" intent="brand" size="sm" onClick={() => setOpen(true)}>Open the modal</Button>
      </ProtoPanelSection>

      {toast && (
        <div className="fixed right-xl bottom-xl z-50 w-[380px]">
          <Toast type="success" title="Duplicate rules saved" onClose={() => setToast(false)} />
        </div>
      )}
    </div>
  );
}
