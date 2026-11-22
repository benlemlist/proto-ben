// Settings › Data management › Statuses › Contact status (FEATURE-1804).
// Layout: settings sidebar | data management tabs | object cards | lifecycle | events | save bar.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  SidebarSettings, SidebarSection, SidebarHeadingItem, SidebarItem, Tabs, TabList, TabTrigger, Button, Badge, Toast, EmptyState, cn,
} from "@l3mpire/ui";
import {
  faGearOutline, faUsersOutline, faBadgeDollarOutline, faEnvelopeOutline, faAddressBookOutline, faSlidersOutline, faXmarkOutline,
  faBuildingsOutline, faCoinOutline, faStarsOutline,
} from "@l3mpire/icons";
import { ContactStatusProvider, useCS } from "./store";
import { SCENARIOS } from "./data";
import { LifecycleCard } from "./components/LifecycleCard";
import { EventsCard } from "./components/EventsCard";
import { SaveModal } from "./components/SaveModal";
import { Simulator } from "./components/Simulator";
import { ProtoCommands } from "./components/ProtoCommands";
import { protoTitle } from "../../lib/proto-identity";

const DM_TABS = ["Enrichment", "Lead scoring", "Duplicates", "Fields update", "Statuses", "Website visitor"];

const OBJECTS = [
  { id: "contact", title: "Contact status", description: "Define which campaign events change a contact's status." },
  { id: "account", title: "Account status", description: "How a company and its contacts update each other." },
  { id: "deal", title: "Deal status", description: "Which deal stages change the company's status." },
];

export default function StatusesPage() {
  return (
    <ContactStatusProvider>
      <Layout />
    </ContactStatusProvider>
  );
}

function Layout() {
  const s = useCS();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Statuses");
  const [object, setObject] = useState("contact");
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => { document.title = protoTitle("Contact status"); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") { e.preventDefault(); s.setCommandsOpen(!s.commandsOpen); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s]);

  const scenario = SCENARIOS.find((x) => x.id === s.scenario)!;

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
          <Tabs value={tab} onValueChange={(t) => (t === "Duplicates" ? navigate("/settings/data-management/duplicates") : setTab(t))} className="flex-1">
            <TabList hasOffset>
              {DM_TABS.map((t) => <TabTrigger key={t} value={t}>{t}</TabTrigger>)}
            </TabList>
          </Tabs>
          <Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faXmarkOutline} aria-label="Close settings" onClick={() => navigate("/contacts")} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab !== "Statuses" ? (
            <div className="flex h-full items-center justify-center p-4xl">
              <EmptyState icon={faStarsOutline} title={tab} description="Not part of this prototype. Open the Statuses tab." />
            </div>
          ) : (
            <div className="mx-auto flex max-w-[1164px] flex-col gap-xl p-xl pb-[96px]">
              <div className="grid grid-cols-3 gap-lg">
                {OBJECTS.map((o) => (
                  <button key={o.id} type="button" onClick={() => setObject(o.id)}
                    className={cn(
                      "flex flex-col gap-2xs rounded-lg border px-lg py-md text-left hover:bg-[var(--core-bg-main-hover)]",
                      object === o.id ? "border-[var(--core-border-main-selected)]" : "border-[var(--core-border-main-subtle)]",
                    )}>
                    <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{o.title}</span>
                    <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{o.description}</span>
                  </button>
                ))}
              </div>

              {object === "contact" ? (
                <>
                  <LifecycleCard />
                  <EventsCard />
                </>
              ) : (
                <div className="rounded-lg border border-[var(--core-border-main-subtle)] p-4xl">
                  <EmptyState icon={object === "account" ? faBuildingsOutline : faCoinOutline} title={object === "account" ? "Account status" : "Deal status"} description="Same logic, next step: contact ↔ account and deal → account. Not designed yet." />
                </div>
              )}
            </div>
          )}
        </div>

        {s.dirty && (
          <div className="absolute right-0 bottom-0 left-[260px] z-20 flex items-center justify-between gap-lg border-t border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] px-2xl py-lg shadow-lg">
            <span className="text-base leading-base text-[var(--core-text-main-primary)]">You have unsaved changes</span>
            <div className="flex gap-base">
              <Button appearance="ghost" intent="brand" size="md" onClick={s.discard}>Discard</Button>
              <Button appearance="outlined" intent="brand" size="md" onClick={() => s.setSimOpen(true)}>Try on a contact</Button>
              <Button appearance="solid" intent="brand" size="md" onClick={() => setSaveOpen(true)}>Save</Button>
            </div>
          </div>
        )}
      </div>

      <button type="button" onClick={() => s.setCommandsOpen(true)} className={cn("absolute left-lg z-30", s.dirty ? "bottom-[80px]" : "bottom-lg")} title="Proto: team shown (⌘⇧K)">
        <Badge type="indigo" size="md">{scenario.label}</Badge>
      </button>

      <SaveModal open={saveOpen} onOpenChange={setSaveOpen} />
      <Simulator />
      <ProtoCommands />

      <div className="pointer-events-none fixed right-xl bottom-[96px] z-50 flex w-[380px] flex-col gap-base">
        {s.toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast type={t.type} title={t.title} subtitle={t.subtitle} onClose={() => s.dismissToast(t.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
