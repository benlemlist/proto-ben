// Proto controls of New signals, in the floating proto panel (⌘⇧K). Also `window.proto` in the console and `?signal=aiAdoption` in the URL.
import { useEffect } from "react";
import { ProtoPanelSection, ProtoGroup, ProtoToggle, ProtoAction } from "../../../lib/proto-panel";
import { faBoltOutline } from "@l3mpire/icons";
import { useSig } from "../store";
import { NEW_IDS, signalType } from "../data";

export function ProtoCommands() {
  const s = useSig();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("signal");
    if (t && NEW_IDS.includes(t)) { s.openWizard(); setTimeout(() => s.pickType(t), 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.deploy(type)": NEW_IDS.join(" | "),
        "proto.deliver()": "New signals for every live agent",
        "proto.tracking(on)": "Website tracking script installed or not",
        "proto.dark(on)": "Dark mode",
        "proto.reset()": "Back to the seed data",
      }),
      deploy: (type: string) => { s.openWizard(); setTimeout(() => s.pickType(type), 0); },
      deliver: () => s.deliverSignals(),
      tracking: (on = true) => s.setTracking(on),
      dark: (on = true) => s.setTheme(on ? "dark" : "light"),
      reset: s.reset,
    };
  });

  return (
    <ProtoPanelSection title="New signals" onReset={s.reset}>
      <ProtoGroup label="Setup">
        <ProtoToggle label="Show only the 11 new signals" checked={s.newOnly} onChange={s.setNewOnly} />
        <ProtoToggle label="Tracking script installed on lemlist.com" checked={s.trackingInstalled} onChange={s.setTracking} />
      </ProtoGroup>
      <ProtoGroup label="Simulate">
        <ProtoAction icon={faBoltOutline} onClick={s.deliverSignals}>Deliver signals now</ProtoAction>
      </ProtoGroup>
      <ProtoGroup label="Open the wizard on a new signal">
        {NEW_IDS.map((id) => <ProtoAction key={id} onClick={() => { s.openWizard(); setTimeout(() => s.pickType(id), 0); }}>{signalType(id).shortTitle}</ProtoAction>)}
      </ProtoGroup>
      <ProtoGroup label="Display">
        <ProtoToggle label="Dark mode" checked={s.theme === "dark"} onChange={(v) => s.setTheme(v ? "dark" : "light")} />
      </ProtoGroup>
    </ProtoPanelSection>
  );
}
