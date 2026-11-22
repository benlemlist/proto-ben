// The suggested-lists feed: "Built for you" (ICP) + "Fresh from signals", with the lazy-generation loading state.
import { useMemo } from "react";
import { Button, Link, Skeleton, Badge, InfoMessage, cn } from "@l3mpire/ui";
import { Icon, faArrowRightOutline } from "@l3mpire/icons";
import { usePdb } from "../store";
import { COMING_SOON, fa, fmt, leadsFor, type SuggestedList } from "../data";
import { AvatarStack, ListBadge, ListMeta, Muted } from "./shared";

export function Feed() {
  const s = usePdb();
  const icp = s.lists.filter((l) => l.section === "icp").sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0)).slice(0, 5);
  const signals = s.signalsEmpty ? [] : s.lists.filter((l) => l.section === "signal").sort((a, b) => (a.hoursAgo ?? 0) - (b.hoursAgo ?? 0));
  const loading = s.feed === "generating";

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4xl px-3xl py-3xl">
      {loading && (
        <InfoMessage type="ai" title="lemAgent is building your first lists"
          description="It reads your company profile and past campaigns to match the 450M+ contacts of the People database to your ICP. It takes a few seconds, only once." />
      )}

      <Section
        title="Built for you"
        subtitle="Free, ready-to-use lists from our database, matched to your company profile."
        onPrefs={() => s.setPrefsOpen(true)}
      >
        {loading ? <SkeletonCards n={3} /> : icp.map((l) => <ListCard key={l.id} list={l} />)}
      </Section>

      <Section
        title="Fresh from signals"
        subtitle="lemAgent watches hiring, job changes and tool changes in your ICP. New lists every morning."
        onPrefs={() => s.setPrefsOpen(true)}
      >
        {loading ? <SkeletonCards n={3} /> : signals.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-sm rounded-lg border border-dashed border-[var(--core-border-main-primary)] px-2xl py-3xl text-center">
            <Icon icon={fa("radar")} size="xl" className="text-[var(--core-text-main-tertiary)]" />
            <span className="text-base leading-base font-semibold text-[var(--core-text-main-primary)]">No fresh signal in your ICP today</span>
            <Muted>lemAgent checks every morning. Widen your ICP in preferences to catch more signals.</Muted>
          </div>
        ) : signals.map((l) => <ListCard key={l.id} list={l} />)}
        {!loading && <NicheCard />}
      </Section>

      {!loading && (
        <div className="flex flex-wrap items-center gap-sm border-t border-[var(--core-border-main-subtle)] pt-xl">
          <Muted className="mr-xs">More signals coming soon</Muted>
          {COMING_SOON.map((c) => (
            <Badge key={c.id} type="neutral" size="sm" icon={c.icon}>{c.label}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, onPrefs, children }: { title: string; subtitle: string; onPrefs: () => void; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-xl">
      <div className="flex items-end justify-between gap-xl">
        <div className="flex flex-col gap-2xs">
          <span className="text-xxl leading-xl font-solid text-[var(--core-text-main-primary)]">{title}</span>
          <span className="text-base leading-base text-[var(--core-text-main-secondary)]">{subtitle}</span>
        </div>
        <Link intent="brand" size="sm" onClick={onPrefs} className="shrink-0">Manage preferences</Link>
      </div>
      <div className="grid grid-cols-1 gap-xl md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

export function ListCard({ list }: { list: SuggestedList }) {
  const s = usePdb();
  const preview = useMemo(() => leadsFor(list, 4), [list]);
  return (
    <article
      className={cn(
        "group flex cursor-pointer flex-col rounded-lg border bg-[var(--core-bg-main-primary)] p-xl transition-colors hover:border-[var(--core-border-main-secondary)]",
        list.isNew ? "border-[var(--core-border-main-selected)]" : "border-[var(--core-border-main-subtle)]",
      )}
      onClick={() => s.openList(list.id)}
    >
      <div className="flex items-center justify-between gap-base">
        <ListBadge list={list} />
        <ListMeta list={list} />
      </div>
      <div className="mt-lg flex flex-1 flex-col gap-xs">
        <span className="text-md leading-md font-semibold text-[var(--core-text-main-primary)]">{list.title}</span>
        <span className="text-base leading-base text-[var(--core-text-main-secondary)]">{list.description}</span>
      </div>
      <span className="mt-xl text-base leading-base font-semibold text-[var(--core-text-main-primary)]">{fmt(list.leadCount)} leads</span>
      <div className="mt-lg flex items-center justify-between gap-base border-t border-[var(--core-border-main-subtle)] pt-lg">
        <AvatarStack leads={preview} total={list.leadCount} />
        <Button appearance="outlined" intent="brand" size="sm" rightIcon={faArrowRightOutline}
          onClick={(e) => { e.stopPropagation(); s.openList(list.id); }}>
          Open list
        </Button>
      </div>
    </article>
  );
}

/** "Niche lists for your ICP": agent-built on demand. Coming soon in V1. */
function NicheCard() {
  const s = usePdb();
  return (
    <article className="flex flex-col rounded-lg border border-dashed border-[var(--core-border-main-primary)] p-xl">
      <div className="flex items-center justify-between gap-base">
        <Badge type="ai" size="sm" icon={fa("sparkles")}>Niche list</Badge>
        <Muted>Coming soon</Muted>
      </div>
      <div className="mt-lg flex flex-1 flex-col gap-xs">
        <span className="text-md leading-md font-semibold text-[var(--core-text-main-primary)]">Ask lemAgent for a niche list</span>
        <span className="text-base leading-base text-[var(--core-text-main-secondary)]">Describe a segment our filters can't express. lemAgent builds the list from scratch in 1–2 hours.</span>
      </div>
      <div className="mt-xl flex justify-end border-t border-[var(--core-border-main-subtle)] pt-lg">
        <Button appearance="outlined" intent="brand" size="sm" leftIcon={fa("bell")}
          onClick={() => s.toast({ type: "success", title: "You're on the list", subtitle: "We'll tell you when niche lists are available." })}>
          Notify me
        </Button>
      </div>
    </article>
  );
}

function SkeletonCards({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} aria-busy className="flex flex-col gap-lg rounded-lg border border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)] p-xl">
          <div className="flex justify-between"><Skeleton type="badge" className="!w-[120px]" /><Skeleton type="body" style={{ width: "22%" }} /></div>
          <Skeleton type="title" style={{ width: `${[72, 84, 64][i % 3]}%` }} />
          <Skeleton type="body" style={{ width: `${[88, 76, 82][i % 3]}%` }} />
          <Skeleton type="body" style={{ width: "30%" }} />
          <div className="flex items-center justify-between border-t border-[var(--core-border-main-subtle)] pt-lg">
            <div className="flex">{[0, 1, 2, 3].map((k) => <Skeleton key={k} type="avatar" className={cn("!h-[24px] !w-[24px]", k > 0 && "-ml-sm")} />)}</div>
            <Skeleton type="block" className="h-[28px] w-[96px]" />
          </div>
        </div>
      ))}
    </>
  );
}
