// Settings › Integrations › Salesforce: CRM sync custom activity mapping (PM: Edouard, FEATURE-4018).
// Ben's simplified take on Edouard's proto: fixed values move from Advanced › Default values into
// Field Mapping, and an activity object's rows are the Salesforce fields lemlist writes.
// Shell = the prod settings full modal; CRM detail tabs mirror lemapp/client/settings/react/crm/crm-detail/crm-detail.tsx.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button, EmptyState, InfoMessage, Tabs, TabList, TabTrigger } from "@l3mpire/ui";
import { faXmarkOutline, faStarsOutline, faArrowUpRightFromSquareOutline } from "@l3mpire/icons";
import { SettingsModal } from "../../components/settings/SettingsModal";
import { protoTitle } from "../../lib/proto-identity";
import { ProtoPanelSection, ProtoGroup, ProtoChoice, ProtoAction } from "../../lib/proto-panel";
import { ACTIVITIES, EDOUARD_PROTO, LEGACY, NATURAL, objectOf, type Activity, type Mapping, type ObjectId } from "./data";
import { FieldMappingTab } from "./components/FieldMappingTab";
import { ActivitiesTab } from "./components/ActivitiesTab";

const TABS = [
  { id: "general", label: "General" },
  { id: "field_mapping", label: "Field Mapping" },
  { id: "user_mapping", label: "User Mapping" },
  { id: "activities", label: "Activities" },
  { id: "advanced_settings", label: "Advanced settings" },
  { id: "logs", label: "Logs" },
  { id: "api_calls", label: "API Calls" },
];

type Team = "new" | "existing";
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export default function CrmMappingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("field_mapping");
  const [team, setTeam] = useState<Team>("new");
  const [mapping, setMapping] = useState<Mapping>(() => clone(NATURAL));
  const [activities, setActivities] = useState<Activity[]>(() => clone(ACTIVITIES));
  const [newObjects, setNewObjects] = useState<Set<ObjectId>>(new Set());

  useEffect(() => { document.title = protoTitle("CRM activity mapping"); }, []);

  const reset = (t: Team) => {
    setTeam(t);
    setMapping(clone(t === "new" ? NATURAL : LEGACY));
    setActivities(clone(ACTIVITIES));
    setNewObjects(new Set());
  };

  const changeActivity = (id: string, patch: Partial<Activity>) => {
    const usedBefore = new Set(activities.filter((a) => a.on).map((a) => objectOf(a.destination)));
    const next = activities.map((a) => (a.id === id ? { ...a, ...patch } : a));
    next.filter((a) => a.on).forEach((a) => {
      const o = objectOf(a.destination);
      if (!usedBefore.has(o)) setNewObjects((s) => new Set(s).add(o));
    });
    setActivities(next);
  };

  return (
    <SettingsModal page="integrations">
      <div className="relative flex shrink-0 flex-col gap-base border-b border-[var(--core-border-main-subtle)] pt-lg pl-lg pr-[56px]">
        <div className="flex items-center gap-base pl-base">
          <span className="text-lg leading-lg font-semibold text-[var(--core-text-main-primary)]">Salesforce integration</span>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabList className="border-b-0">
            {TABS.map((t) => <TabTrigger key={t.id} value={t.id}>{t.label}</TabTrigger>)}
          </TabList>
        </Tabs>
        <Button appearance="ghost" intent="brand" size="md" iconOnly leftIcon={faXmarkOutline} aria-label="Close settings" className="absolute top-lg right-lg" onClick={() => navigate("/contacts")} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1164px] flex-col gap-xl p-2xl">
          {tab === "field_mapping" && (
            <FieldMappingTab
              mapping={mapping}
              setMapping={setMapping}
              activities={activities}
              newObjects={newObjects}
              onOpenActivities={() => setTab("activities")}
            />
          )}
          {tab === "activities" && <ActivitiesTab activities={activities} onChange={changeActivity} onOpenMapping={() => setTab("field_mapping")} />}
          {tab === "advanced_settings" && <AdvancedSettings onOpenMapping={() => setTab("field_mapping")} />}
          {!["field_mapping", "activities", "advanced_settings"].includes(tab) && (
            <div className="flex justify-center p-4xl">
              <EmptyState icon={faStarsOutline} title={TABS.find((t) => t.id === tab)?.label ?? ""} description="Not part of this prototype. Open Field Mapping or Activities." />
            </div>
          )}
        </div>
      </div>

      <ProtoPanelSection title="CRM activity mapping" onReset={() => reset(team)}>
        <ProtoGroup label="Team">
          <ProtoChoice<Team> value={team} onChange={reset} options={[{ value: "new", label: "New team (natural values)" }, { value: "existing", label: "Existing team (today's titles)" }]} />
        </ProtoGroup>
        <ProtoGroup label="Compare">
          <ProtoAction icon={faArrowUpRightFromSquareOutline} href={EDOUARD_PROTO}>Edouard's proto</ProtoAction>
        </ProtoGroup>
      </ProtoPanelSection>
    </SettingsModal>
  );
}

/** Default values stay for records; activity tabs are gone (now in Field Mapping). */
function AdvancedSettings({ onOpenMapping }: { onOpenMapping: () => void }) {
  return (
    <div className="flex flex-col gap-lg rounded-lg border border-[var(--core-border-main-subtle)] p-xl">
      <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">Default values</span>
      <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Contacts, Accounts, Leads and Opportunities only, unchanged from prod.</span>
      <InfoMessage
        type="info"
        description="Fixed values on Tasks, Email messages and Events are set in Field Mapping: pick « Fixed value » or « A value per activity » on any Salesforce field."
        linkLabel="Open Field Mapping"
        onLinkClick={onOpenMapping}
      />
    </div>
  );
}
