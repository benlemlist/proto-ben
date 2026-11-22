// V2 — lemAgent opened from a company list. Scope always visible → short analysis of the accounts → suggestions
// with the why, a relevance score, coverage and cost → total → Deploy in the chat → confirmation.
// Editing a suggestion opens the watch-list settings in a side panel (scope locked to the list).
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Badge, Button, Checkbox, InfoMessage, Skeleton, TextArea, cn } from "@l3mpire/ui";
import { Icon, faArrowUpOutline, faPenOutline, faXmarkOutline, faLockOutline } from "@l3mpire/icons";
import { useMonitoring } from "../store";
import { LISTS, SIGNALS, estimate, fa, fmt, profileOf, signal, type Suggestion } from "../data";
import { EditAgentPanel } from "./EditAgentPanel";

const Muted = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("text-sm leading-sm text-[var(--core-text-main-tertiary)]", className)}>{children}</span>
);

function ScorePill({ score }: { score: number }) {
  const type = score >= 75 ? "success" : score >= 60 ? "warning" : "neutral";
  return <Badge type={type} size="sm">{score}% fit</Badge>;
}

export function AgentPanelV2() {
  const s = useMonitoring();
  const run = s.run!;
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const list = LISTS.find((l) => l.id === run.scope.listId)!;
  const p = profileOf(run.scope.companyIds);

  // Follow the conversation (new answers, deploy result), but show suggestions from their top: the analysis comes first.
  useEffect(() => { if (run.chat.length || run.phase === "deployed") bottom.current?.scrollIntoView({ block: "end" }); }, [run.phase, run.chat.length]);

  const available = run.suggestions.filter((x) => signal(x.type).supportsList);
  const unavailable = run.suggestions.filter((x) => !signal(x.type).supportsList);
  const on = available.filter((x) => x.enabled && x.companyIds.length > 0);
  const total = on.reduce((acc, x) => { const e = estimate(x); return { signals: acc.signals + e.signals, credits: acc.credits + e.credits }; }, { signals: 0, credits: 0 });
  const covered = run.suggestions.find((x) => x.alreadyCovered > 0);

  const send = () => {
    const q = text.trim();
    if (!q) return;
    const match = Object.values(SIGNALS).find((d) => q.toLowerCase().includes(d.label.toLowerCase().split(" ")[0].toLowerCase()) && q.length > 3);
    if (match && match.supportsList) {
      s.addSuggestion({
        id: `sug-${match.id}`, type: match.id, name: match.label, why: "Added on your request.", score: 60,
        companyIds: run.scope.companyIds, alreadyCovered: 0, enabled: true, dailyLimit: 20, processing: "task",
      });
      s.say(q, `Added “${match.label}” on the ${fmt(run.scope.companyIds.length)} companies. It's in the list above, on.`);
    } else if (match) {
      s.say(q, `“${match.label}” can't watch a list yet, only a whole segment. I'd rather not monitor companies outside your list.`);
    } else {
      s.say(q, "Noted. Switch agents on or off above, or edit one to change what it watches. You can also ask me to add a signal, for example “add cost cutting”.");
    }
    setText("");
  };

  const deployed = run.phase === "deployed";
  const deployedWls = s.watchlists.filter((w) => run.deployedIds.includes(w.id));

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-r border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]">
      <div className="flex h-[44px] items-center justify-between gap-base border-b border-[var(--core-border-main-subtle)] px-lg">
        <span className="flex items-center gap-xs text-base leading-base font-medium text-[var(--core-text-main-primary)]">
          <Icon icon={fa("sparkles")} size="xs" label="" /> Monitor accounts
        </span>
        <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faXmarkOutline} aria-label="Close lemAgent" onClick={s.closePanel} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-xl overflow-auto px-lg py-lg">
        {/* User intent, with the scope as a chip: never lost while the user scrolls the table. */}
        <div className="flex flex-col items-end gap-xs self-end">
          <div className="rounded-lg bg-[var(--core-bg-main-secondary)] px-lg py-base text-base leading-base">Monitor signals on these accounts</div>
          <Badge type="neutral" size="sm" icon={fa("building")}>{run.scope.label}</Badge>
        </div>

        {run.phase === "analysing" ? (
          <div className="flex flex-col gap-base" aria-busy>
            <span className="flex items-center gap-xs text-base leading-base text-[var(--core-text-main-secondary)]">
              <span className="inline-flex animate-spin"><Icon icon={fa("spinner-third")} size="xs" label="" /></span>
              Analysing {fmt(run.scope.companyIds.length)} companies…
            </span>
            <Skeleton type="body" style={{ width: "84%" }} />
            <Skeleton type="body" style={{ width: "76%" }} />
            <Skeleton type="block" className="h-[88px] w-full rounded-lg" />
            <Skeleton type="block" className="h-[88px] w-full rounded-lg" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-sm text-base leading-base text-[var(--core-text-main-primary)]">
              <span>
                I looked at the {fmt(p.total)} companies of <span className="font-medium">{run.scope.kind === "selection" ? `your selection in ${list.name}` : list.name}</span>:
                mostly {p.topIndustry} ({p.topIndustryCount}), {p.scaling} scaling between 200 and 5,000 people, {p.opportunities} open leads or opportunities.
              </span>
              <span>Here are the agents I'd put on them. Each one watches <span className="font-medium">only these companies</span>, never the whole database.</span>
            </div>

            {covered && (
              <InfoMessage type="info" title="No double monitoring"
                description={`${covered.alreadyCovered} companies are already watched by “${covered.coveredBy}”. I left them out of the same signal.`} />
            )}

            <div className="flex flex-col gap-base">
              {available.map((x) => (
                <SuggestionCard key={x.id} x={x} disabled={deployed || run.phase === "deploying"} onEdit={() => setEditing(x.id)} />
              ))}
            </div>

            {unavailable.length > 0 && (
              <div className="flex flex-col gap-sm">
                <Muted>Good fit, but can't watch a list yet</Muted>
                {unavailable.map((x) => (
                  <div key={x.id} className="flex items-center justify-between gap-base rounded-lg border border-dashed border-[var(--core-border-main-subtle)] px-lg py-base opacity-70">
                    <span className="flex min-w-0 items-center gap-sm">
                      <Icon icon={faLockOutline} size="xs" label="" />
                      <Badge type={signal(x.type).badge} size="sm" icon={signal(x.type).icon}>{signal(x.type).label}</Badge>
                    </span>
                    <Muted>Coming soon</Muted>
                  </div>
                ))}
              </div>
            )}

            {run.chat.map((m, i) => m.role === "user" ? (
              <div key={i} className="self-end rounded-lg bg-[var(--core-bg-main-secondary)] px-lg py-base text-base leading-base">{m.text}</div>
            ) : (
              <div key={i} className="text-base leading-base text-[var(--core-text-main-primary)]">{m.text}</div>
            ))}

            {deployed && (
              <div className="flex flex-col gap-base">
                <InfoMessage type="success" title={`${deployedWls.length} agent${deployedWls.length > 1 ? "s are" : " is"} live`}
                  description={`They watch the ${fmt(run.scope.companyIds.length)} companies of ${run.scope.kind === "selection" ? "your selection" : list.name}. New signals show in the Signals column, and in your Signals page.`} />
                <div className="flex flex-col gap-xs">
                  {deployedWls.map((w) => (
                    <span key={w.id} className="flex items-center gap-sm text-base leading-base">
                      <Icon icon={fa("radar")} size="xs" label="" className="text-[var(--core-text-functional-success)]" />
                      <span className="truncate">{w.name}</span>
                      <Muted className="ml-auto whitespace-nowrap">{fmt(w.companyIds.length)} co.</Muted>
                    </span>
                  ))}
                </div>
                <div className="flex gap-sm">
                  <Button appearance="outlined" intent="brand" size="sm" rightIcon={fa("arrow-up-right")} onClick={() => navigate("/signals")}>Open Signals</Button>
                  <Button appearance="ghost" intent="brand" size="sm" onClick={s.closePanel}>Done</Button>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottom} />
      </div>

      {/* Sticky total + Deploy: the cost is known before anything runs. */}
      {(run.phase === "suggested" || run.phase === "deploying") && (
        <div className="flex flex-col gap-base border-t border-[var(--core-border-main-subtle)] px-lg py-base">
          <div className="flex items-center justify-between gap-base">
            <span className="text-base leading-base font-medium whitespace-nowrap text-[var(--core-text-main-primary)]">{on.length} agent{on.length > 1 ? "s" : ""} · {fmt(run.scope.companyIds.length)} companies</span>
            <Muted className="whitespace-nowrap">~{fmt(total.signals)} signals · ~{fmt(total.credits)} cr./mo</Muted>
          </div>
          <Button appearance="solid" intent="brand" size="md" className="w-full" leftIcon={fa("radar")} disabled={on.length === 0} loading={run.phase === "deploying"} onClick={s.deploy}>
            Deploy {on.length} agent{on.length > 1 ? "s" : ""}
          </Button>
          <Muted className="text-center">Credits are only used when a signal is found. Pause anytime in Signals.</Muted>
        </div>
      )}

      <div className="border-t border-[var(--core-border-main-subtle)] p-lg">
        <div className="flex flex-col gap-sm">
          <TextArea placeholder="Ask to add, remove or change an agent…" value={text} disabled={run.phase === "analysing"}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <div className="flex justify-end">
            <Button appearance="solid" intent="brand" size="sm" iconOnly leftIcon={faArrowUpOutline} aria-label="Send" disabled={!text.trim()} onClick={send} />
          </div>
        </div>
      </div>

      <EditAgentPanel suggestionId={editing} onClose={() => setEditing(null)} />
    </aside>
  );
}

function SuggestionCard({ x, disabled, onEdit }: { x: Suggestion; disabled: boolean; onEdit: () => void }) {
  const s = useMonitoring();
  const def = signal(x.type);
  const e = estimate(x);
  return (
    <div className={cn("flex flex-col gap-sm rounded-lg border p-lg", x.enabled ? "border-[var(--core-border-main-selected)]" : "border-[var(--core-border-main-subtle)]")}>
      <div className="flex items-start gap-sm">
        <span className="pt-2xs"><Checkbox checked={x.enabled} disabled={disabled || x.companyIds.length === 0} onCheckedChange={(v) => s.toggleSuggestion(x.id, v === true)} /></span>
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <div className="flex items-center justify-between gap-sm">
            <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">{x.name}</span>
            <ScorePill score={x.score} />
          </div>
          <div><Badge type={def.badge} size="sm" icon={def.icon}>{def.label}</Badge></div>
          <span className="text-sm leading-sm text-[var(--core-text-main-secondary)]">{x.why}</span>
          <div className="flex items-center justify-between gap-sm pt-2xs">
            <Muted>
              {x.companyIds.length === 0 ? `All ${x.alreadyCovered} already watched by “${x.coveredBy}”` : <>{fmt(x.companyIds.length)} companies{x.alreadyCovered > 0 && ` (${x.alreadyCovered} already watched)`} · ~{fmt(e.signals)} signals · ~{fmt(e.credits)} cr./mo</>}
            </Muted>
            <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faPenOutline} aria-label="Edit agent" disabled={disabled || x.companyIds.length === 0} onClick={onEdit} />
          </div>
        </div>
      </div>
    </div>
  );
}
