// Inbox options in the floating proto panel: which delivery lots are shown.
// Lots are cumulative: checking lot 3 checks lots 1 and 2; unchecking lot 3
// also unchecks lots 4–6. "Prod" (lot 0) is the base and always checked.
import { Checkbox, Link } from "@l3mpire/ui";
import { ProtoPanelSection } from "../../../lib/proto-panel";
import { useInbox } from "../store";
import { LOTS } from "../lots";

const LABEL: Record<number, string> = {
  0: "Prod",
  1: "Lot 1 · Trust",
  2: "Lot 2 · Reply without Gmail",
  3: "Lot 3 · Triage",
  4: "Lot 4 · All messages",
  5: "Lot 5 · Team",
  6: "Lot 6 · AI",
};

export function LotsPanel() {
  const s = useInbox();
  return (
    <ProtoPanelSection title="Inbox · delivery lots">
      <div className="flex flex-col gap-sm">
        {LOTS.map(({ lot }) => (
          <Checkbox
            key={lot}
            label={LABEL[lot]}
            checked={lot <= s.lot}
            disabled={lot === 0}
            onCheckedChange={(v) => s.setLot(v === true ? lot : lot - 1)}
          />
        ))}
      </div>
      <Link intent="neutral" size="sm" className="self-start" href="#" onClick={(e) => { e.preventDefault(); s.setCommandsOpen(true); }}>
        More proto commands (⌘⇧K)
      </Link>
    </ProtoPanelSection>
  );
}
