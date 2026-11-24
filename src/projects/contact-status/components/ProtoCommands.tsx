// Proto controls of Contact status, in the floating proto panel (⌘⇧K). Also `window.proto` in the console and `?scenario=hubspot` in the URL.
import { useEffect } from "react";
import { ProtoPanelSection, ProtoGroup, ProtoChoice, ProtoToggle, ProtoAction } from "../../../lib/proto-panel";
import { faPlayOutline } from "@l3mpire/icons";
import { useCS } from "../store";
import { SCENARIOS } from "../data";

export function ProtoCommands() {
  const s = useCS();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sc = q.get("scenario");
    if (sc && SCENARIOS.some((x) => x.id === sc)) s.loadScenario(sc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (window as unknown as { proto: unknown }).proto = {
      help: () => console.table({
        "proto.scenario(id)": SCENARIOS.map((x) => x.id).join(" | "),
        "proto.try()": "Open the contact simulator",
        "proto.reset()": "Reset the current scenario",
        "proto.dark(on)": "Dark mode",
        "proto.state()": "Saved and draft config",
      }),
      scenario: s.loadScenario,
      try: () => s.setSimOpen(true),
      reset: s.reset,
      dark: (on = true) => s.setTheme(on ? "dark" : "light"),
      state: () => ({ saved: s.saved, draft: s.draft, dirty: s.dirty }),
    };
  });

  return (
    <ProtoPanelSection title="Contact status" onReset={s.reset}>
      <ProtoGroup label="Team">
        <ProtoChoice value={s.scenario} onChange={s.loadScenario} options={SCENARIOS.map((sc) => ({ value: sc.id, label: sc.label }))} />
      </ProtoGroup>
      <ProtoGroup label="Simulate">
        <ProtoAction icon={faPlayOutline} onClick={() => s.setSimOpen(true)}>Try on a contact</ProtoAction>
      </ProtoGroup>
      <ProtoGroup label="Display">
        <ProtoToggle label="Dark mode" checked={s.theme === "dark"} onChange={(v) => s.setTheme(v ? "dark" : "light")} />
      </ProtoGroup>
    </ProtoPanelSection>
  );
}
