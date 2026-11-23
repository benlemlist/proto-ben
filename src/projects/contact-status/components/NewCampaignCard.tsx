// "When a contact joins a new campaign" (grooming 25/09, "last vs max"): the one behaviour setting
// of the page, in its own card between the lifecycle and Events so it isn't missed.
import { RadioCardGroup, RadioCard } from "@l3mpire/ui";
import { faPaperPlaneTopOutline } from "@l3mpire/icons";
import { useCS } from "../store";
import { Card } from "./shared";

// lemDS RadioCard truncates its text to one line; here the examples must be read in full.
const WRAP = "items-start [&_.truncate]:whitespace-normal";

export function NewCampaignCard() {
  const s = useCS();
  const cfg = s.draft;
  return (
    <Card
      icon={faPaperPlaneTopOutline}
      title="When a contact joins a new campaign"
      description="Within a campaign, a contact only moves forward. Choose what happens when it joins another one."
    >
      <RadioCardGroup value={cfg.newLeadRule} onValueChange={(v) => s.setDraft((c) => ({ ...c, newLeadRule: v as typeof c.newLeadRule }))}>
        <RadioCard
          className={WRAP}
          value="latest"
          title="Start over"
          description="The latest campaign wins. Not interested in January, contacted again in September → Contacted."
        />
        <RadioCard
          className={WRAP}
          value="highest"
          title="Keep the highest stage"
          description="A contact keeps the furthest stage it reached. A webinar invite never turns an Opportunity back into Contacted."
        />
      </RadioCardGroup>
    </Card>
  );
}
