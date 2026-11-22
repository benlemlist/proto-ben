// "Deploy new agent" — full-screen wizard (prod WatchListModal + WatchListModalStepHeader).
// Step -1 = "Signal to detect" picker (no stepper, like prod), then 4 steps with the stepper.
import { useMemo, useState } from "react";
import { Modal, ModalContent, Button, SearchBar, Stepper, Badge, BadgeSpecific, cn } from "@l3mpire/ui";
import { Icon, faXmarkOutline, faChevronDownOutline, faChevronRightOutline } from "@l3mpire/icons";
import { GROUPS, SIGNAL_TYPES, WIZARD_STEPS, fa, signalType, type GroupId, type SignalType } from "../data";
import { useSig } from "../store";
import { StepConfigure, configValid } from "./StepConfigure";
import { StepScope, scopeValid } from "./StepScope";
import { StepProcessing, processingValid } from "./StepProcessing";
import { StepSummary } from "./StepSummary";
import { Muted } from "./ui";

export function Wizard() {
  const s = useSig();
  const w = s.wizard;
  if (!w) return null;
  const a = w.draft;
  const t = a.type ? signalType(a.type) : undefined;

  const valid = [
    !!a.name.trim() && configValid(a),
    scopeValid(a),
    processingValid(a),
    true,
  ];
  const canNext = w.step === -1 ? !!a.type : valid[w.step];
  const next = () => {
    if (w.step === 3) return s.deploy();
    if (w.step === -1 && !a.name) s.setDraft((d) => ({ ...d, name: "" }));
    s.setStep(w.step + 1);
  };

  return (
    <Modal open onOpenChange={(o) => !o && s.closeWizard()}>
      <ModalContent size="full" className="flex h-[calc(100vh-48px)] flex-col overflow-hidden p-0">
        {/* Header */}
        {w.step === -1 ? (
          <div className="flex items-center justify-between border-b border-[var(--core-border-main-subtle)] px-xl py-base">
            <span className="text-md leading-md font-solid text-[var(--core-text-main-primary)]">{w.editId ? "Edit agent" : "Deploy new agent"}</span>
            <Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faXmarkOutline} aria-label="Close" onClick={s.closeWizard} />
          </div>
        ) : (
          <div className="flex flex-col border-b border-[var(--core-border-main-subtle)]">
            <div className="flex items-center justify-between gap-base px-xl py-base">
              <div className="flex min-w-0 items-center gap-sm">
                <span>{a.emoji}</span>
                <span className="truncate text-md leading-md font-medium text-[var(--core-text-main-primary)]">{a.name || t?.title}</span>
                {t && <Badge type="neutral" size="sm" icon={t.icon}>{t.shortTitle}</Badge>}
                {t?.isNew && <BadgeSpecific type="new">New</BadgeSpecific>}
              </div>
              <Button appearance="ghost" intent="brand" size="sm" iconOnly leftIcon={faXmarkOutline} aria-label="Close" onClick={s.closeWizard} />
            </div>
            <div className="px-lg">
              <Stepper current={w.step} steps={WIZARD_STEPS.map((label, i) => ({ label, done: i < w.step && valid[i], disabled: i !== w.step }))} />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--core-bg-main-secondary)]">
          <div className="mx-auto w-full max-w-[920px] px-xl py-2xl">
            {w.step === -1 && <SignalPicker />}
            {w.step === 0 && <StepConfigure />}
            {w.step === 1 && <StepScope />}
            {w.step === 2 && <StepProcessing />}
            {w.step === 3 && <StepSummary />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--core-border-main-subtle)] px-xl py-lg">
          {w.step === -1
            ? <Button appearance="ghost" intent="brand" size="md" leftIcon={fa("circle-info")} onClick={() => s.toast({ type: "info", title: "Missing a signal? Tell us.", subtitle: "Opens the feedback modal in prod." })}>Missing a signal? Tell us.</Button>
            : <Button appearance="ghost" intent="brand" size="md" onClick={s.closeWizard}>Cancel</Button>}
          <div className="flex items-center gap-base">
            {w.step >= 0 && <Button appearance="outlined" intent="brand" size="md" disabled={w.step === 0 && !!w.editId} onClick={() => s.setStep(w.step - 1)}>Previous</Button>}
            <Button appearance="solid" intent="brand" size="md" disabled={!canNext} onClick={next}>{w.step === 3 ? (w.editId ? "Update agent" : "Deploy agent") : "Next"}</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function SignalPicker() {
  const s = useSig();
  const [q, setQ] = useState("");
  const pool = SIGNAL_TYPES.filter((x) => !s.newOnly || x.isNew);
  const byGroup = useMemo(() => {
    const term = q.trim().toLowerCase();
    const m = new Map<GroupId, SignalType[]>();
    pool.filter((x) => !term || `${x.title} ${x.shortTitle} ${x.description}`.toLowerCase().includes(term))
      // new signals first inside their group, so they're seen without scrolling
      .sort((x, y) => Number(!!y.isNew) - Number(!!x.isNew))
      .forEach((x) => m.set(x.group, [...(m.get(x.group) ?? []), x]));
    return m;
  }, [q, pool]);
  const total = [...byGroup.values()].reduce((n, l) => n + l.length, 0);

  return (
    <div className="flex flex-col gap-lg">
      <SearchBar variant="white" size="md" placeholder="Search signals, keyword, ..." value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} onClear={() => setQ("")} />
      {total === 0 ? (
        <div className="p-3xl text-center"><Muted>No signals found</Muted></div>
      ) : (
        GROUPS.map((g) => {
          const cards = byGroup.get(g.id) ?? [];
          if (!cards.length) return null;
          return <Group key={`${g.id}-${q ? "s" : "i"}`} group={g} cards={cards} defaultOpen={!!q || cards.some((c) => c.isNew)} />;
        })
      )}
    </div>
  );
}

function Group({ group, cards, defaultOpen }: { group: (typeof GROUPS)[number]; cards: SignalType[]; defaultOpen: boolean }) {
  const s = useSig();
  const [open, setOpen] = useState(defaultOpen);
  const fresh = cards.filter((c) => c.isNew).length;
  return (
    <section className="rounded-lg border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-lg px-xl py-lg text-left">
        <Icon icon={group.icon} size="sm" className="text-[var(--core-text-main-tertiary)]" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">{group.title}</span>
          <Muted>{group.description}</Muted>
        </div>
        {fresh > 0 && <Badge type="info" size="sm">{fresh} new</Badge>}
        <Badge type="neutral" size="sm">{cards.length}</Badge>
        <Icon icon={open ? faChevronDownOutline : faChevronRightOutline} size="sm" className="text-[var(--core-text-main-tertiary)]" />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-base border-t border-[var(--core-border-main-subtle)] p-lg">
          {cards.map((c) => {
            const sel = s.wizard?.draft.type === c.id;
            return (
              <button key={c.id} type="button" disabled={c.comingSoon} onClick={() => s.pickType(c.id)}
                className={cn("relative flex items-start gap-lg rounded-lg border p-lg text-left transition-colors",
                  sel ? "border-[var(--core-border-main-selected)] bg-[var(--core-bg-main-hover)]" : "border-[var(--core-border-main-subtle)] hover:bg-[var(--core-bg-main-hover)]")}>
                <span className="flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--core-bg-main-secondary)] shadow-sm">
                  <Icon icon={c.icon} size="sm" className="text-[var(--core-text-main-tertiary)]" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2xs pr-3xl">
                  <span className="flex items-center gap-sm">
                    <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{c.title}</span>
                    {c.isNew && <BadgeSpecific type="new">New</BadgeSpecific>}
                  </span>
                  <Muted>{c.description}</Muted>
                </span>
                <span className="absolute top-lg right-lg">
                  <Badge type="neutral" size="sm" icon={c.entity === "company" ? fa("building") : fa("user")}>{c.entity === "company" ? "Company" : "Contact"}</Badge>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
