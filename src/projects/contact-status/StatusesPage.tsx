// Settings › Data management › Statuses › Contact status (FEATURE-1804).
// Shell = the prod settings full modal (src/components/settings/SettingsModal.tsx).
// Inside: data management tabs | object cards | lifecycle | events | save bar.
import { useEffect, useState } from "react";
import { Badge, Button, Toast, EmptyState, cn } from "@l3mpire/ui";
import { faBuildingsOutline, faCoinOutline, faStarsOutline } from "@l3mpire/icons";
import { ContactStatusProvider, useCS } from "./store";
import { SCENARIOS } from "./data";
import { LifecycleCard } from "./components/LifecycleCard";
import { EventsCard } from "./components/EventsCard";
import { FeatureSwitch } from "./components/FeatureSwitch";
import { NewCampaignCard } from "./components/NewCampaignCard";
import { SaveModal } from "./components/SaveModal";
import { Simulator } from "./components/Simulator";
import { ProtoCommands } from "./components/ProtoCommands";
import { SettingsModal, DataManagementHeader } from "../../components/settings/SettingsModal";
import { DATA_MANAGEMENT_TABS } from "../../components/settings/tabs";
import { protoTitle } from "../../lib/proto-identity";

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
  const [tab, setTab] = useState("statuses");
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
  const tabLabel = DATA_MANAGEMENT_TABS.find((t) => t.id === tab)?.label ?? tab;

  const overlays = (
    <>
      <button type="button" onClick={() => s.setCommandsOpen(true)} className={cn("absolute left-2xl z-30", s.dirty ? "bottom-[80px]" : "bottom-2xl")} title="Proto: team shown (⌘⇧K)">
        <Badge type="indigo" size="md">{scenario.label}</Badge>
      </button>
      <div className="pointer-events-none absolute right-2xl bottom-[96px] z-40 flex w-[380px] flex-col gap-base">
        {s.toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast type={t.type} title={t.title} subtitle={t.subtitle} onClose={() => s.dismissToast(t.id)} />
          </div>
        ))}
      </div>
    </>
  );

  return (
    <SettingsModal page="dataManagement" overlays={overlays}>
      <DataManagementHeader tab={tab} onTab={setTab} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab !== "statuses" ? (
          <div className="flex h-full items-center justify-center p-4xl">
            <EmptyState icon={faStarsOutline} title={tabLabel} description="Already in lemlist, not part of this prototype. Open the Statuses tab." />
          </div>
        ) : (
          <div className="mx-auto flex max-w-[1164px] flex-col gap-xl p-2xl pb-[96px]">
            <div className="grid grid-cols-3 gap-lg">
              {OBJECTS.map((o) => (
                <button key={o.id} type="button" onClick={() => setObject(o.id)}
                  className={cn(
                    "flex flex-col gap-2xs rounded-lg border px-lg py-md text-left hover:bg-[var(--core-bg-main-hover)]",
                    object === o.id ? "border-[var(--core-border-main-selected)]" : "border-[var(--core-border-main-primary)]",
                  )}>
                  <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{o.title}</span>
                  <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{o.description}</span>
                </button>
              ))}
            </div>

            {object === "contact" ? (
              <>
                <FeatureSwitch />
                <LifecycleCard />
                {s.draft.enabled && <NewCampaignCard />}
                {s.draft.enabled && <EventsCard />}
              </>
            ) : (
              <div className="rounded-lg border border-[var(--core-border-main-primary)] p-4xl">
                <EmptyState icon={object === "account" ? faBuildingsOutline : faCoinOutline} title={object === "account" ? "Account status" : "Deal status"} description="Same logic, next step: contact ↔ account and deal → account. Not designed yet." />
              </div>
            )}
          </div>
        )}
      </div>

      {s.dirty && tab === "statuses" && (
        <div className="absolute right-0 bottom-0 left-0 z-20 flex items-center justify-end gap-lg border-t border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)] px-2xl py-lg shadow-lg">
          <div className="flex gap-base">
            <Button appearance="ghost" intent="brand" size="md" onClick={s.discard}>Discard</Button>
            <Button appearance="outlined" intent="brand" size="md" onClick={() => s.setSimOpen(true)}>Try on a contact</Button>
            <Button appearance="solid" intent="brand" size="md" onClick={() => setSaveOpen(true)}>Save</Button>
          </div>
        </div>
      )}

      <SaveModal open={saveOpen} onOpenChange={setSaveOpen} />
      <Simulator />
      <ProtoCommands />
    </SettingsModal>
  );
}
