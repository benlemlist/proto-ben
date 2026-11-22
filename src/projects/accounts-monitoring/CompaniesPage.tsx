// Accounts list monitoring — create signals from a company list (Notion FEATURE-4869, docs in projects/accounts-monitoring).
// CRM Companies view. Layout: [lemAgent panel] | list tabs · toolbar · grid · bulk actions.
// V1 = Maxime L's Figma iteration, V2 = Ben's proposal. Switch in the floating proto panel.
import { useEffect } from "react";
import {
  BrowserTab, BrowserTabItem, BulkAction, Button, SearchBar, Toast, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  type BulkActionItem,
} from "@l3mpire/ui";
import { Icon, faFilterOutline, faPlusOutline, faArrowDownShortWideOutline } from "@l3mpire/icons";
import { MonitoringProvider, useMonitoring } from "./store";
import { LISTS, companiesOf, fa, fmt } from "./data";
import { CompaniesTable } from "./components/CompaniesTable";
import { AgentPanelV1 } from "./components/AgentPanelV1";
import { AgentPanelV2 } from "./components/AgentPanelV2";
import { VersionPanel } from "./components/VersionPanel";
import { protoTitle } from "../../lib/proto-identity";

export default function CompaniesPage() {
  return (
    <MonitoringProvider>
      <Layout />
    </MonitoringProvider>
  );
}

function Layout() {
  const s = useMonitoring();
  const v2 = s.version === "v2";
  const list = LISTS.find((l) => l.id === s.listId)!;
  const companies = companiesOf(s.listId);
  const monitored = companies.filter((c) => s.watchlistsOf(c.id).length > 0).length;

  useEffect(() => { document.title = protoTitle(list.name); }, [list]);

  const soon = (title: string) => () => s.toast({ type: "info", title, subtitle: "Not part of this prototype." });

  const bulk: BulkActionItem[] = [
    { id: "list", label: "Add to list", icon: faPlusOutline, onClick: soon("Add to list") },
    { id: "enrich", label: "Enrichment", icon: fa("sparkles"), onClick: soon("Enrichment") },
    { id: "monitor", label: "Monitor signals", icon: v2 ? fa("radar") : fa("bullseye"), ...(v2 ? { appearance: "solid" as const, intent: "brand" as const } : {}),
      onClick: () => (v2 ? s.startRun("selection") : s.openV1()) },
    { id: "task", label: "Create task", icon: fa("list-check"), onClick: soon("Create task") },
  ];

  return (
    <TooltipProvider>
      <div className="relative flex h-full min-h-0 bg-[var(--core-bg-main-primary)]">
        {s.panelOpen && (v2 ? s.run && <AgentPanelV2 /> : <AgentPanelV1 />)}

        <div className="flex min-w-0 flex-1 flex-col">
          <BrowserTab onAddTab={soon("New view")}>
            {LISTS.map((l) => (
              <BrowserTabItem key={l.id} icon={l.crm ? fa("list") : fa("buildings")} label={l.name} badge={String(companiesOf(l.id).length)}
                isActive={l.id === s.listId} pinned={!l.crm} onClick={() => s.setListId(l.id)} />
            ))}
          </BrowserTab>

          <div className="flex shrink-0 items-center justify-between gap-lg px-lg py-base">
            <div className="flex items-center gap-sm">
              <div className="w-[220px]"><SearchBar placeholder="Search..." size="sm" /></div>
              <Button appearance="outlined" intent="brand" size="sm" leftIcon={faArrowDownShortWideOutline}>Sort by AI fit</Button>
              <Button appearance="outlined" intent="brand" size="sm" leftIcon={faFilterOutline}>Filters</Button>
              {v2 && list.crm && (
                <span className="ml-sm flex items-center gap-xs text-sm leading-sm text-[var(--core-text-main-tertiary)]">
                  <Icon icon={fa("radar")} size="xs" label="" />{fmt(monitored)} of {fmt(companies.length)} monitored
                </span>
              )}
            </div>
            <div className="flex items-center gap-sm">
              {v2 ? (
                <>
                  <Button appearance="outlined" intent="ai" size="sm" leftIcon={fa("sparkles")} onClick={soon("AI columns")}>AI columns</Button>
                  {list.crm ? (
                    <Button appearance="outlined" intent="brand" size="sm" leftIcon={fa("radar")} onClick={() => s.startRun("list")}>Monitor signals</Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span><Button appearance="outlined" intent="brand" size="sm" leftIcon={fa("radar")} disabled>Monitor signals</Button></span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Open a company list to monitor it, or select companies. Your whole database can't be monitored.</TooltipContent>
                    </Tooltip>
                  )}
                  <Button appearance="solid" intent="brand" size="sm" leftIcon={faPlusOutline}>Import companies</Button>
                </>
              ) : s.panelOpen ? (
                <Button appearance="solid" intent="brand" size="sm" leftIcon={faPlusOutline}>Import companies</Button>
              ) : (
                <Button appearance="solid" intent="brand" size="sm" leftIcon={faPlusOutline} onClick={s.openV1}>Monitor signals</Button>
              )}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-auto">
            <CompaniesTable companies={companies} />
            {s.selected.length > 0 && <BulkAction count={s.selected.length} countLabel="selected" onClear={() => s.setSelected([])} actions={bulk} />}
          </div>
        </div>

        <VersionPanel />

        <div className="pointer-events-none fixed right-xl bottom-xl z-50 flex w-[380px] flex-col gap-base">
          {s.toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast type={t.type} title={t.title} subtitle={t.subtitle} onClose={() => s.dismissToast(t.id)} />
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
