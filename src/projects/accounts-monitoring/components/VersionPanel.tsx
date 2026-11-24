// Accounts monitoring options in the floating proto panel: V1 (Maxime L, Figma) ↔ V2 (Ben) + scenarios.
import { faBoltOutline } from "@l3mpire/icons";
import { ProtoPanelSection, ProtoGroup, ProtoChoice, ProtoAction } from "../../../lib/proto-panel";
import { useMonitoring, type Version } from "../store";

const NOTE: Record<Version, string> = {
  v1: "Figma “Companies page”: 4 entry points, radio cards, flow stops at the suggestions.",
  v2: "2 entry points on a CRM list, monitored vs. received in one column, why + score + total cost, deploy in the chat.",
};

export function VersionPanel() {
  const s = useMonitoring();
  return (
    <ProtoPanelSection title="Accounts list monitoring" onReset={s.reset}>
      <ProtoGroup label="Version" hint={NOTE[s.version]}>
        <ProtoChoice<Version> value={s.version} onChange={s.setVersion} options={[{ value: "v1", label: "V1 · Maxime L (Figma)" }, { value: "v2", label: "V2 · Ben" }]} />
      </ProtoGroup>
      <ProtoGroup label="Simulate">
        {s.version === "v2" ? (
          <>
            <ProtoAction icon={faBoltOutline} onClick={() => s.startRun("list", "tier1")}>Monitor “Tier 1 accounts”</ProtoAction>
            <ProtoAction icon={faBoltOutline} onClick={s.simulateSignals}>Next morning: first signals found</ProtoAction>
          </>
        ) : (
          <ProtoAction icon={faBoltOutline} onClick={s.openV1}>Open the agent panel</ProtoAction>
        )}
      </ProtoGroup>
    </ProtoPanelSection>
  );
}
