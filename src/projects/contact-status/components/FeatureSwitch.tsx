// The feature's on/off, above both cards: it drives the statuses card (plain list ↔ lifecycle)
// and the Events card (hidden when off). Turning it on for a team that never set it up places
// its statuses and maps the events for it (PM note 27/10: propose, the team corrects).
import { SwitchCard } from "@l3mpire/ui";
import { faBoltOutline } from "@l3mpire/icons";
import { useCS } from "../store";
import { suggestFor } from "../data";

export function FeatureSwitch() {
  const s = useCS();
  const cfg = s.draft;

  const onChange = (on: boolean) => {
    if (!on) {
      s.setDraft((c) => ({ ...c, enabled: false }));
      return;
    }
    const neverSetUp = cfg.statuses.every((st) => st.column === "unused") && !Object.values(cfg.mapping).some(Boolean);
    s.setDraft((c) => (neverSetUp ? { ...c, ...suggestFor(c.statuses), enabled: true } : { ...c, enabled: true }));
    if (neverSetUp) {
      s.toast({ type: "info", title: "We set it up for you", subtitle: "Your statuses are placed in a lifecycle and every event is mapped. Review it, then save." });
    }
  };

  return (
    <SwitchCard
      icon={faBoltOutline}
      title="Move contact status with lead status"
      description={cfg.enabled
        ? "Campaign events move each contact along your lifecycle. You can still change a status by hand."
        : "Off: a contact status only changes by hand, by CSV, API or from your CRM."}
      checked={cfg.enabled}
      onCheckedChange={onChange}
    />
  );
}
