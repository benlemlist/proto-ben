// lemAgent panel next to PeopleDB (as in Maël's proto). V1: a describe-your-leads prompt. The answer points to the closest
// suggested lists, since on-demand niche lists are coming soon.
import { useState } from "react";
import { Button, TextArea, Badge } from "@l3mpire/ui";
import { Icon, faArrowUpOutline, faXmarkOutline } from "@l3mpire/icons";
import { usePdb } from "../store";
import { fa, fmt } from "../data";
import { Muted } from "./shared";

const IDEAS = [
  { icon: fa("bullhorn"), label: "Sales leaders posting about outbound" },
  { icon: fa("microphone"), label: "Founders speaking at sales events" },
  { icon: fa("plane-departure"), label: "Companies expanding to the US" },
];

interface Msg { role: "user" | "agent"; text: string; listIds?: string[] }

export function AgentPanel() {
  const s = usePdb();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const send = (q: string) => {
    if (!q.trim()) return;
    const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const scored = s.lists
      .map((l) => ({ l, score: words.filter((w) => `${l.title} ${l.description}`.toLowerCase().includes(w)).length }))
      .sort((a, b) => b.score - a.score || (b.l.fit ?? 0) - (a.l.fit ?? 0));
    setMsgs((m) => [...m,
      { role: "user", text: q },
      { role: "agent", text: "Building a niche list from scratch is coming soon. Meanwhile, these suggested lists are the closest to what you describe:", listIds: scored.slice(0, 2).map((x) => x.l.id) },
    ]);
    setText("");
  };

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-r border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]">
      <div className="flex h-[56px] items-center justify-between gap-base border-b border-[var(--core-border-main-subtle)] px-xl">
        <span className="flex items-center gap-sm text-base leading-base font-semibold text-[var(--core-text-main-primary)]">
          <Icon icon={fa("sparkles")} size="sm" /> lemAgent
        </span>
        <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={faXmarkOutline} aria-label="Close lemAgent" onClick={() => s.setAgentPanel(false)} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-xl overflow-auto px-xl py-xl">
        {msgs.length === 0 ? (
          <div className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <span className="text-xl leading-xl font-solid text-[var(--core-text-main-primary)]">Who do you want to reach?</span>
              <span className="text-base leading-base text-[var(--core-text-main-secondary)]">Describe your leads with any criteria. I'll find the list for you.</span>
            </div>
            <div className="flex flex-col">
              {IDEAS.map((i) => (
                <button key={i.label} type="button" onClick={() => send(i.label)}
                  className="flex items-center gap-base rounded-base px-sm py-base text-left text-base leading-base text-[var(--core-text-main-primary)] hover:bg-[var(--core-bg-main-hover)]">
                  <Icon icon={i.icon} size="sm" className="text-[var(--core-text-main-tertiary)]" /> {i.label}
                </button>
              ))}
            </div>
          </div>
        ) : msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="self-end rounded-lg bg-[var(--core-bg-main-secondary)] px-lg py-base text-base leading-base">{m.text}</div>
        ) : (
          <div key={i} className="flex flex-col gap-base text-base leading-base text-[var(--core-text-main-primary)]">
            <span>{m.text}</span>
            {m.listIds?.map((id) => {
              const l = s.lists.find((x) => x.id === id);
              if (!l) return null;
              return (
                <button key={id} type="button" onClick={() => s.openList(id)}
                  className="flex flex-col gap-2xs rounded-lg border border-[var(--core-border-main-subtle)] px-lg py-base text-left hover:border-[var(--core-border-main-secondary)]">
                  <span className="font-medium">{l.title}</span>
                  <Muted>{fmt(l.leadCount)} leads · {l.section === "icp" ? `${l.fit}% ICP fit` : "From signals"}</Muted>
                </button>
              );
            })}
            <div><Badge type="ai" size="sm" icon={fa("sparkles")}>Niche lists · coming soon</Badge></div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--core-border-main-subtle)] p-xl">
        <div className="flex flex-col gap-sm">
          <TextArea placeholder="Describe the leads you need…" value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} />
          <div className="flex justify-end">
            <Button appearance="solid" intent="brand" size="sm" iconOnly leftIcon={faArrowUpOutline} aria-label="Send" disabled={!text.trim()} onClick={() => send(text)} />
          </div>
        </div>
      </div>
    </aside>
  );
}
