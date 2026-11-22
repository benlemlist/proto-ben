// V2 — edit a suggested agent before deploying it: the watch-list settings, prefilled, with the scope locked
// to the company list (segmentType: 'list'). Same fields as the Signals wizard (limit, processing).
import { useEffect, useState } from "react";
import {
  Badge, Button, InputLabel, ModalBody, ModalDescription, ModalFooter, ModalHeader, ModalTitle, RadioGroup, RadioGroupItem,
  SidePanel, SidePanelContent, TextInput,
} from "@l3mpire/ui";
import { Icon, faLockOutline } from "@l3mpire/icons";
import { useMonitoring } from "../store";
import { LISTS, PROCESSING, estimate, fmt, signal, type ProcessingId } from "../data";

const LIMITS = [5, 20, 50];

export function EditAgentPanel({ suggestionId, onClose }: { suggestionId: string | null; onClose: () => void }) {
  const s = useMonitoring();
  const x = s.run?.suggestions.find((y) => y.id === suggestionId);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(20);
  const [processing, setProcessing] = useState<ProcessingId>("task");

  useEffect(() => {
    if (x) { setName(x.name); setLimit(x.dailyLimit); setProcessing(x.processing); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionId]);

  if (!x || !s.run) return null;
  const def = signal(x.type);
  const list = LISTS.find((l) => l.id === s.run!.scope.listId)!;
  const e = estimate(x);

  const save = () => {
    s.updateSuggestion(x.id, { name: name.trim() || x.name, dailyLimit: limit, processing, enabled: true });
    onClose();
  };

  return (
    <SidePanel open={!!suggestionId} onOpenChange={(v: boolean) => !v && onClose()}>
      <SidePanelContent>
        <ModalHeader onClose={onClose}>
          <ModalTitle>Edit agent</ModalTitle>
          <ModalDescription>Changes apply when you deploy.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2xl">
            <div className="flex flex-col gap-sm">
              <InputLabel>Signal</InputLabel>
              <div><Badge type={def.badge} size="md" icon={def.icon}>{def.label}</Badge></div>
            </div>
            <TextInput label="Agent name" size="md" value={name} onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setName(ev.target.value)} />

            <div className="flex flex-col gap-sm">
              <InputLabel>Scope</InputLabel>
              <div className="flex items-center justify-between gap-base rounded-base border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-secondary)] px-lg py-base">
                <span className="flex flex-col">
                  <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{s.run.scope.kind === "selection" ? `${list.name} · selection` : list.name}</span>
                  <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">
                    {fmt(x.companyIds.length)} companies{x.alreadyCovered > 0 && ` · ${x.alreadyCovered} left out (already watched)`}
                  </span>
                </span>
                <Icon icon={faLockOutline} size="xs" label="Locked" className="text-[var(--core-text-main-tertiary)]" />
              </div>
              <span className="text-sm leading-sm text-[var(--core-text-main-tertiary)]">Locked to the company list. Companies added to the list later are watched too.</span>
            </div>

            <div className="flex flex-col gap-sm">
              <InputLabel>Identification limit</InputLabel>
              <div className="flex gap-xs">
                {LIMITS.map((l) => (
                  <Button key={l} appearance={limit === l ? "solid" : "outlined"} intent="brand" size="sm" onClick={() => setLimit(l)}>{l} / day</Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <InputLabel>When a signal is found</InputLabel>
              <RadioGroup value={processing} onValueChange={(v: string) => setProcessing(v as ProcessingId)}>
                {PROCESSING.map((p) => <RadioGroupItem key={p.id} value={p.id} label={p.label} />)}
              </RadioGroup>
            </div>
          </div>
        </ModalBody>
        <ModalFooter infoMessage={`~${fmt(e.signals)} signals · ~${fmt(e.credits)} credits / month`}>
          <Button appearance="ghost" intent="brand" size="md" onClick={onClose}>Cancel</Button>
          <Button appearance="solid" intent="brand" size="md" onClick={save}>Save</Button>
        </ModalFooter>
      </SidePanelContent>
    </SidePanel>
  );
}
