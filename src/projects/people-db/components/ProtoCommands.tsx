// Proto controls of PeopleDB suggested lists, in the floating proto panel (⌘⇧K). Also `window.proto` in the console.
import { useEffect } from "react";
import { ProtoPanelSection, ProtoGroup, ProtoChoice, ProtoToggle, ProtoAction } from "../../../lib/proto-panel";
import { faBoltOutline } from "@l3mpire/icons";
import { usePdb } from "../store";
import { PROFILES } from "../data";

export function ProtoCommands() {
  const s = usePdb();

  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.profile(id)": PROFILES.map((p) => p.id).join(" | "),
        "proto.firstOpen()": "First PeopleDB open of an existing account (lists generated)",
        "proto.fresh()": "Deliver today's signal list",
        "proto.noSignals(on)": "No fresh signal in the ICP",
        "proto.agent(on)": "lemAgent panel",
        "proto.dark(on)": "Dark mode",
        "proto.reset()": "Back to the seed data",
      }),
      profile: s.setProfile,
      firstOpen: s.firstOpen,
      fresh: s.deliverFresh,
      noSignals: (on = true) => s.setSignalsEmpty(on),
      agent: (on = true) => s.setAgentPanel(on),
      dark: (on = true) => s.setTheme(on ? "dark" : "light"),
      reset: s.reset,
    };
  });

  return (
    <ProtoPanelSection title="PeopleDB suggested lists" onReset={s.reset}>
      <ProtoGroup label="Company profile">
        <ProtoChoice value={s.profileId} onChange={s.setProfile} options={PROFILES.map((p) => ({ value: p.id, label: `${p.company} · ${p.pitch.split(" for ")[0]}` }))} />
      </ProtoGroup>
      <ProtoGroup label="Simulate">
        <ProtoAction icon={faBoltOutline} onClick={s.firstOpen}>First open (lists generating)</ProtoAction>
        <ProtoAction icon={faBoltOutline} onClick={s.deliverFresh}>Next morning: new signals</ProtoAction>
        <ProtoToggle label="No fresh signal today" checked={s.signalsEmpty} onChange={s.setSignalsEmpty} />
      </ProtoGroup>
      <ProtoGroup label="Display">
        <ProtoToggle label="lemAgent panel" checked={s.agentPanel} onChange={s.setAgentPanel} />
        <ProtoToggle label="Dark mode" checked={s.theme === "dark"} onChange={(v) => s.setTheme(v ? "dark" : "light")} />
      </ProtoGroup>
    </ProtoPanelSection>
  );
}
