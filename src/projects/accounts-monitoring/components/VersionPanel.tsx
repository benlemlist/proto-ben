// Accounts monitoring options in the floating proto panel: V1 (Maxime L, Figma) ↔ V2 (Ben) + scenarios.
import { Link, RadioGroup, RadioGroupItem } from "@l3mpire/ui";
import { ProtoPanelSection } from "../../../lib/proto-panel";
import { useMonitoring, type Version } from "../store";

const NOTE: Record<Version, string> = {
  v1: "Figma “Companies page”: 4 entry points, radio cards, flow stops at the suggestions.",
  v2: "2 entry points on a CRM list, monitored vs. received in one column, why + score + total cost, deploy in the chat.",
};

export function VersionPanel() {
  const s = useMonitoring();
  const act = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(); };
  return (
    <ProtoPanelSection title="Accounts monitoring · version">
      <RadioGroup value={s.version} onValueChange={(v: string) => s.setVersion(v as Version)}>
        <RadioGroupItem value="v1" label="V1 · Maxime L (Figma)" />
        <RadioGroupItem value="v2" label="V2 · Ben" />
      </RadioGroup>
      <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">{NOTE[s.version]}</span>
      <div className="flex flex-col items-start gap-xs">
        {s.version === "v2" ? (
          <>
            <Link intent="brand" size="sm" href="#" onClick={act(() => s.startRun("list", "tier1"))}>Monitor “Tier 1 accounts”</Link>
            <Link intent="brand" size="sm" href="#" onClick={act(s.simulateSignals)}>Next morning: first signals found</Link>
          </>
        ) : (
          <Link intent="brand" size="sm" href="#" onClick={act(s.openV1)}>Open the agent panel</Link>
        )}
        <Link intent="neutral" size="sm" href="#" onClick={act(s.reset)}>Reset data</Link>
      </div>
    </ProtoPanelSection>
  );
}
