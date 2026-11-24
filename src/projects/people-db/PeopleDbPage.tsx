// People database — suggested lead lists instead of an empty search (FEATURE-5060).
// Feed of lists (Built for you · Fresh from signals) → "Open list" = pre-filtered PeopleDB view. lemAgent panel on the left.
import { useEffect, useRef } from "react";
import { Button, Badge, Toast } from "@l3mpire/ui";
import { Icon } from "@l3mpire/icons";
import { PeopleDbProvider, usePdb } from "./store";
import { fa } from "./data";
import { Feed } from "./components/Feed";
import { ListView } from "./components/ListView";
import { AgentPanel } from "./components/AgentPanel";
import { PrefsModal } from "./components/PrefsModal";
import { ProtoCommands } from "./components/ProtoCommands";
import { Muted } from "./components/shared";
import { protoTitle } from "../../lib/proto-identity";

export default function PeopleDbPage() {
  return (
    <PeopleDbProvider>
      <Layout />
    </PeopleDbProvider>
  );
}

function Layout() {
  const s = usePdb();
  const list = s.openListId ? s.lists.find((l) => l.id === s.openListId) : undefined;

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { document.title = protoTitle(list ? list.title : "People database"); }, [list]);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [s.openListId]);

  return (
    <div className="relative flex h-full min-h-0 bg-[var(--core-bg-main-primary)]">
      {s.agentPanel && <AgentPanel />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[56px] shrink-0 items-center justify-between gap-lg border-b border-[var(--core-border-main-subtle)] px-xl">
          <div className="flex items-center gap-sm">
            {!s.agentPanel && (
              <Button appearance="ghost" intent="ai" size="sm" leftIcon={fa("sparkles")} onClick={() => s.setAgentPanel(true)}>lemAgent</Button>
            )}
            <Icon icon={fa("users")} size="sm" className="text-[var(--core-text-main-secondary)]" />
            <span className="text-md leading-md font-semibold text-[var(--core-text-main-primary)]">People database</span>
          </div>
          <div className="flex items-center gap-lg">
            <Muted>Unlocked this month <span className="font-semibold text-[var(--core-text-main-primary)]">412 leads</span></Muted>
            <Badge type="neutral" size="md" icon={fa("coins")}>1,240 credits</Badge>
            <Button appearance="outlined" intent="brand" size="sm" leftIcon={fa("filter")}
              onClick={() => s.toast({ type: "info", title: "Search with filters", subtitle: "The classic PeopleDB search stays available, unchanged in V1." })}>
              Search with filters
            </Button>
          </div>
        </header>

        <div ref={scroller} className="min-h-0 flex-1 overflow-auto bg-[var(--core-bg-main-secondary)]">
          {list ? <ListView key={list.id} list={list} /> : <Feed />}
        </div>
      </div>

      <PrefsModal />
      <ProtoCommands />

      <div className="pointer-events-none fixed right-xl bottom-[96px] z-[60] flex w-[380px] flex-col gap-base">
        {s.toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast type={t.type} title={t.title} subtitle={t.subtitle} onClose={() => s.dismissToast(t.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
