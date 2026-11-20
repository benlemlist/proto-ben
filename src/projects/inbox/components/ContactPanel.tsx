// Contact panel: who this is, every participant of the conversation (lot 4), notes (lot 5).
import { useState } from "react";
import { ObjectPanelHeader, Tabs, TabList, TabTrigger, Button, Badge, ObjectButton, Avatar, getAvatarTone } from "@l3mpire/ui";
import { faEnvelopeOutline, faPhoneOutline, faBuildingsOutline, faPaperPlaneTopOutline, faUserOutline } from "@l3mpire/icons";
import { Icon } from "@l3mpire/icons";
import { useInbox } from "../store";
import { visibleMessages, channelsOf } from "../logic";
import { campaigns, team } from "../data";
import { InterestPill, PersonAvatar, Muted } from "./shared";
import { CHANNEL_META } from "./meta";
import { faUserPlusOutline } from "../icons";
import type { Person } from "../types";

export function ContactPanel() {
  const s = useInbox();
  const conv = s.convs.find((c) => c.id === s.selectedId);
  const [tab, setTab] = useState("contact");
  if (!conv || !s.panelOpen) return null;
  const p = conv.person;
  const msgs = visibleMessages(conv, s.ctx);
  const participants = s.has("participants") ? conv.participants : [];
  const owner = team.find((t) => t.id === conv.ownerId)!;

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[var(--core-border-main-subtle)] bg-[var(--core-bg-main-primary)]">
      <ObjectPanelHeader
        type="contact" name={p.name} initials={p.name.split(" ").map((x) => x[0]).join("").slice(0, 2)} tone={getAvatarTone(p.email ?? p.name)}
        role={p.jobTitle ? `${p.jobTitle} at` : undefined}
        company={p.companyName ? { label: p.companyName, initials: p.companyName.slice(0, 2) } : undefined}
        hasLinkedIn={!!p.linkedinUrl}
        crm={p.contactId ? { label: "Synced to HubSpot" } : undefined}
        onClose={() => s.setPanelOpen(false)}
        tabs={
          <Tabs value={tab} onValueChange={setTab}>
            <TabList>
              <TabTrigger value="contact">Contact</TabTrigger>
              {s.has("participants") && <TabTrigger value="people" badge={participants.length ? String(participants.length + 1) : undefined}>Participants</TabTrigger>}
              {s.has("notes") && <TabTrigger value="notes" badge={conv.notes.length ? String(conv.notes.length) : undefined}>Notes</TabTrigger>}
            </TabList>
          </Tabs>
        }
      />
      <div className="flex flex-col gap-xl p-xl">
        {tab === "contact" && (
          <>
            {!p.contactId && (
              <div className="flex flex-col gap-base rounded-lg border border-[var(--core-border-functional-warning)] bg-[var(--core-bg-functional-invert-warning)] p-lg">
                <span className="text-base leading-base font-medium text-[var(--core-text-main-primary)]">Not a contact yet</span>
                <Muted>Add {p.name.split(" ")[0]} to keep this conversation, enrich the profile and sync it to your CRM.</Muted>
                <Button appearance="solid" intent="brand" size="sm" leftIcon={faUserPlusOutline} onClick={() => s.addAsContact(conv.id)}>Add as contact</Button>
              </div>
            )}
            <Section title="Details">
              {p.email && <Row icon={faEnvelopeOutline} value={p.email} />}
              {p.phone && <Row icon={faPhoneOutline} value={p.phone} />}
              {p.linkedinUrl && <Row icon={CHANNEL_META.linkedin.icon} value={p.linkedinUrl.replace("https://", "")} />}
              {p.companyName && <Row icon={faBuildingsOutline} value={`${p.companyName}${p.companyDomain ? ` · ${p.companyDomain}` : ""}`} />}
              <Row icon={faUserOutline} value={`Owner: ${owner.name}`} />
            </Section>
            <Section title="Interest">
              {conv.interest ? <InterestPill interest={conv.interest} size="md" /> : <Muted>Not set</Muted>}
            </Section>
            <Section title="Campaigns">
              {conv.campaignIds.length === 0 ? <Muted>No campaign. Conversation logged from {channelsOf(conv, s.ctx).map((c) => (c === "email" ? "Gmail" : CHANNEL_META[c].label)).join(", ")}.</Muted> :
                conv.campaignIds.map((id) => { const c = campaigns.find((x) => x.id === id)!; return <div key={id}><ObjectButton type="campaign" emoji={c.emoji} label={c.name} /></div>; })}
              <div><Button appearance="ghost" intent="brand" size="xs" leftIcon={faPaperPlaneTopOutline}>Add to campaign</Button></div>
            </Section>
            <Section title="Activity">
              <Muted>{msgs.length} messages · {channelsOf(conv, s.ctx).map((c) => CHANNEL_META[c].label).join(", ")}</Muted>
            </Section>
          </>
        )}
        {tab === "people" && (
          <Section title="People in this conversation">
            <PersonRow person={p} role="Contact" />
            {participants.map((x) => (
              <PersonRow key={x.email ?? x.name} person={x} role={msgs.some((m) => m.cc.some((c) => c.email === x.email)) ? "In CC" : msgs.some((m) => m.forwarded && m.to.some((t) => t.email === x.email)) ? "Forwarded to" : "Participant"}
                action={!x.contactId ? <Button appearance="outlined" intent="brand" size="xs" leftIcon={faUserPlusOutline} onClick={() => s.addParticipantAsContact(conv.id, x.email, x.name)}>Add as contact</Button> : <Badge type="success" size="sm">Contact</Badge>} />
            ))}
            <Muted>Replies from these people stay in this conversation, on {p.name.split(" ")[0]}'s contact.</Muted>
          </Section>
        )}
        {tab === "notes" && (
          <Section title="Internal notes">
            {conv.notes.length === 0 && <Muted>No note yet. Use “Internal note” in the composer.</Muted>}
            {conv.notes.map((n) => {
              const t = team.find((x) => x.id === n.userId)!;
              return (
                <div key={n.id} className="flex gap-base">
                  <Avatar size="sm" initials={t.initials} tone={getAvatarTone(t.id)} />
                  <div className="flex flex-col">
                    <span className="text-sm leading-sm font-medium text-[var(--core-text-main-primary)]">{t.name}</span>
                    <span className="text-sm leading-sm whitespace-pre-wrap text-[var(--core-text-main-secondary)]">{n.body}</span>
                  </div>
                </div>
              );
            })}
          </Section>
        )}
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-base">
      <h3 className="text-sm leading-sm font-semibold text-[var(--core-text-main-secondary)]">{title}</h3>
      {children}
    </section>
  );
}

function Row({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex items-center gap-base text-sm leading-sm text-[var(--core-text-main-primary)]">
      <Icon icon={icon} size="sm" className="text-[var(--core-text-main-tertiary)]" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function PersonRow({ person, role, action }: { person: Person; role: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-base">
      <PersonAvatar person={person} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm leading-sm font-medium text-[var(--core-text-main-primary)]">{person.name}</span>
        <span className="truncate text-xs leading-xs text-[var(--core-text-main-tertiary)]">{role}{person.email ? ` · ${person.email}` : ""}</span>
      </div>
      {action}
    </div>
  );
}
