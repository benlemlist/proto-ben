// Signals — new signals of the Rodz sprint + Ads engagement, built on the prod watch-list UI.
// Tabs: Signals (prod WatchListSignals) · Agents (prod WatchLists). "Deploy agent" opens the wizard.
import { useEffect, useMemo, useState } from "react";
import {
  Tabs, TabList, TabTrigger, Button, SearchBar, Badge, BadgeSpecific, StatusPill, Toast, EmptyState, Avatar,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadixItem, DropdownMenuItem, Select, DropdownMenu, DropdownMenuList, cn,
} from "@l3mpire/ui";
import { faPlusOutline, faBoltOutline } from "@l3mpire/icons";
import { SignalsProvider, useSig } from "./store";
import { CRM_LISTS, PROCESSING, SIGNAL_TYPES, fa, signalType, type Agent } from "./data";
import { relTime, signalLabel, initials } from "./logic";
import { Wizard } from "./components/Wizard";
import { SignalPanel } from "./components/SignalPanel";
import { ProtoCommands } from "./components/ProtoCommands";
import { Muted } from "./components/ui";
import { protoTitle } from "../../lib/proto-identity";

export default function SignalsPage() {
  return (
    <SignalsProvider>
      <Layout />
    </SignalsProvider>
  );
}

function Layout() {
  const s = useSig();
  useEffect(() => { document.title = protoTitle("Signals"); }, []);

  const newCount = s.signals.filter((x) => x.status === "new").length;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[var(--core-bg-main-primary)]">
      <div className="flex items-center justify-between gap-lg px-2xl pt-xl">
        <span className="text-xl leading-xl font-solid text-[var(--core-text-main-primary)]">Signals</span>
        <Button appearance="solid" intent="brand" size="md" leftIcon={faPlusOutline} onClick={() => s.openWizard()}>Deploy agent</Button>
      </div>
      <div className="border-b border-[var(--core-border-main-subtle)] px-lg">
        <Tabs value={s.tab} onValueChange={(v) => s.setTab(v as "signals" | "agents")}>
          <TabList>
            <TabTrigger value="signals" badge={newCount ? String(newCount) : undefined}>Signals</TabTrigger>
            <TabTrigger value="agents" badge={String(s.agents.length)}>Agents</TabTrigger>
          </TabList>
        </Tabs>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {s.tab === "signals" ? <SignalsTable /> : <AgentsTable />}
      </div>

      <Wizard />
      <SignalPanel />
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

const STATUS: Record<string, { label: string; color: "info" | "neutral" | "success" | "critical" }> = {
  new: { label: "New lead", color: "info" }, old: { label: "Old lead", color: "neutral" }, handled: { label: "Handled", color: "success" }, ignored: { label: "Ignored", color: "critical" },
};

function TypeFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const used = SIGNAL_TYPES.filter((t) => t.isNew || ["companyRaisedFunds"].includes(t.id));
  return (
    <Select size="sm" value={value ? signalType(value).shortTitle : "All signal types"} isOpen={open} onOpenChange={setOpen}>
      <DropdownMenu className="w-[280px]"><DropdownMenuList>
        <DropdownMenuItem label="All signal types" selected={!value} onClick={() => { onChange(""); setOpen(false); }} />
        {used.map((t) => <DropdownMenuItem key={t.id} icon={t.icon} label={t.shortTitle} badge={t.isNew ? <BadgeSpecific type="new">New</BadgeSpecific> : undefined} selected={value === t.id} onClick={() => { onChange(t.id); setOpen(false); }} />)}
      </DropdownMenuList></DropdownMenu>
    </Select>
  );
}

function SignalsTable() {
  const s = useSig();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const rows = useMemo(() => s.signals
    .filter((x) => !type || x.type === type)
    .filter((x) => !q || `${x.company.name} ${x.contact?.firstName ?? ""} ${x.contact?.lastName ?? ""}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt)), [s.signals, q, type]);

  return (
    <div className="flex flex-col gap-lg px-2xl py-lg">
      <div className="flex items-center gap-base">
        <div className="w-[260px]"><SearchBar variant="grey" size="sm" placeholder="Search companies, contacts..." value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} onClear={() => setQ("")} /></div>
        <TypeFilter value={type} onChange={setType} />
        <div className="flex-1" />
        <Button appearance="outlined" intent="brand" size="sm" leftIcon={fa("download")}>Export CSV</Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={faBoltOutline} title="No signal found yet" description="It can take a few days for the first signals to appear." />
      ) : (
        <Table variant="borderless">
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((x) => {
              const t = signalType(x.type);
              const agent = s.agents.find((a) => a.id === x.agentId);
              return (
                <TableRow key={x.id} onClick={() => { s.setPanelId(x.id); if (x.status === "new") s.setSignalStatus(x.id, "old"); }}
                  data-state={s.panelId === x.id ? "selected" : undefined} className="cursor-pointer">
                  <TableCell>
                    <div className="flex items-center gap-base">
                      <Avatar size="sm" shape="squared" initials={initials(x.company)} />
                      <span className={cn("text-base leading-base", x.status === "new" && "font-semibold")}>{x.company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-sm">
                      <Badge type="neutral" size="sm" icon={t.icon}>{t.shortTitle}</Badge>
                      <span className="max-w-[260px] truncate text-base leading-base text-[var(--core-text-main-secondary)]">{signalLabel(x)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{x.contact ? `${x.contact.firstName} ${x.contact.lastName}` : <Muted>—</Muted>}</TableCell>
                  <TableCell><span className="block max-w-[220px] truncate whitespace-nowrap text-base leading-base">{agent?.emoji} {agent?.name}</span></TableCell>
                  <TableCell><StatusPill type={STATUS[x.status].color} size="sm">{STATUS[x.status].label}</StatusPill></TableCell>
                  <TableCell><Muted>{relTime(x.detectedAt)}</Muted></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

const AGENT_STATUS: Record<Agent["status"], { label: string; color: "success" | "amber" | "neutral" }> = {
  live: { label: "Live", color: "success" }, paused: { label: "Paused", color: "amber" }, draft: { label: "Draft", color: "neutral" },
};

function AgentsTable() {
  const s = useSig();
  const [q, setQ] = useState("");
  const rows = s.agents.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex flex-col gap-lg px-2xl py-lg">
      <div className="w-[260px]"><SearchBar variant="grey" size="sm" placeholder="Search agents..." value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} onClear={() => setQ("")} /></div>
      <Table variant="borderless">
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Signal type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Signal processing</TableHead>
            <TableHead>Signals past 30d</TableHead>
            <TableHead>Last signal detected</TableHead>
            <TableHead>Billing</TableHead>
            <TableHead>{" "}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((a) => {
            const t = signalType(a.type);
            const sigs = s.signals.filter((x) => x.agentId === a.id);
            const last = sigs.map((x) => x.detectedAt).sort().pop();
            const scope = a.segmentType === "all" ? `All ${t.entity === "company" ? "companies" : "contacts"}` : a.segmentType === "list" ? CRM_LISTS.filter((l) => a.crmListIds.includes(l.id)).map((l) => l.name).join(", ") : a.csvFile;
            return (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => s.openWizard(a.id)}>
                <TableCell><span className="block max-w-[240px] truncate whitespace-nowrap text-base leading-base font-medium">{a.emoji} {a.name}</span></TableCell>
                <TableCell>
                  <div className="flex items-center gap-sm">
                    <Badge type="neutral" size="sm" icon={t.icon}>{t.shortTitle}</Badge>
                    {t.isNew && <BadgeSpecific type="new">New</BadgeSpecific>}
                  </div>
                </TableCell>
                <TableCell><StatusPill type={AGENT_STATUS[a.status].color} size="sm">{AGENT_STATUS[a.status].label}</StatusPill></TableCell>
                <TableCell><span className="block max-w-[180px] truncate text-base leading-base">{scope}</span></TableCell>
                <TableCell>{PROCESSING.find((p) => p.id === a.processing)?.shortLabel}</TableCell>
                <TableCell>{sigs.length}</TableCell>
                <TableCell><Muted>{last ? relTime(last) : "—"}</Muted></TableCell>
                <TableCell className="whitespace-nowrap"><Muted>{t.credits === null ? "Like visitors" : t.hasLimit ? `${t.credits} cr. · max ${a.dailyLimit}/day` : `${t.credits} cr./result`}</Muted></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuRoot>
                    <DropdownMenuTrigger asChild>
                      <Button appearance="ghost" intent="brand" size="xs" iconOnly leftIcon={fa("ellipsis-vertical")} aria-label="Agent actions" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px]">
                      <DropdownMenuList>
                        <DropdownMenuRadixItem icon={fa("pen")} label="Edit agent" onSelect={() => s.openWizard(a.id)} />
                        {a.status === "live"
                          ? <DropdownMenuRadixItem icon={fa("pause")} label="Pause agent" onSelect={() => s.setAgentStatus(a.id, "paused")} />
                          : <DropdownMenuRadixItem icon={fa("play")} label="Resume agent" onSelect={() => s.setAgentStatus(a.id, "live")} />}
                        <DropdownMenuRadixItem icon={fa("bolt")} label="Proto: deliver signals now" onSelect={() => s.deliverSignals(a.id)} />
                        <DropdownMenuRadixItem icon={fa("trash")} label="Remove agent" destructive onSelect={() => s.removeAgent(a.id)} />
                      </DropdownMenuList>
                    </DropdownMenuContent>
                  </DropdownMenuRoot>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
