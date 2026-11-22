// Step "Signal processing" (prod WatchListConfigurationSignalProcessing): Manual / Auto-create tasks / Auto-push to campaign.
// Company signals pushed to a campaign need a sourcing persona (WatchListModalPersonaPicker) — that's where the
// "persona targeting" of the new company signals lives, instead of new per-signal fields.
import { useState } from "react";
import { RadioCardGroup, RadioCard, Select, DropdownMenu, DropdownMenuList, DropdownMenuItem, DropdownMenuDelimiter, InfoMessage, Link } from "@l3mpire/ui";
import { fa, PROCESSING, PERSONAS, CAMPAIGNS, TEAM, signalType, type Agent, type ProcessingId } from "../data";
import { useSig } from "../store";
import { Section, Field, Muted } from "./ui";

export const processingValid = (a: Agent) => a.processing !== "campaign" || !!a.campaign;

export function StepProcessing() {
  const s = useSig();
  const a = s.wizard!.draft;
  const t = signalType(a.type);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [mode, setMode] = useState(a.campaign && a.campaign.startsWith("AI —") ? "ai" : "link");
  const persona = PERSONAS.find((p) => p.id === a.personaId);

  return (
    <div className="flex flex-col gap-xl">
      <RadioCardGroup value={a.processing} onValueChange={(v) => s.setDraft((d) => ({ ...d, processing: v as ProcessingId }))} orientation="vertical" className="grid grid-cols-1 gap-base">
        {PROCESSING.map((p) => <RadioCard key={p.id} value={p.id} icon={p.icon} title={p.label} description={p.description} />)}
      </RadioCardGroup>

      {a.processing === "campaign" && t.personaSourcing && (
        <Section icon={fa("id-card")} title="Personas">
          <Field label="Persona to source your leads from" description="We'll look for this persona from your chosen companies to determine which leads will be sent to your campaign.">
            <Select size="md" placeholder="Select a persona" value={persona?.name} isOpen={personaOpen} onOpenChange={setPersonaOpen}>
              <DropdownMenu className="w-[360px]"><DropdownMenuList>
                {PERSONAS.map((p) => <DropdownMenuItem key={p.id} label={p.name} description={p.description} selected={p.id === a.personaId} onClick={() => { s.setDraft((d) => ({ ...d, personaId: p.id })); setPersonaOpen(false); }} />)}
                <DropdownMenuDelimiter bleed />
                <DropdownMenuItem icon={fa("plus")} label="Create new persona" onClick={() => setPersonaOpen(false)} />
              </DropdownMenuList></DropdownMenu>
            </Select>
          </Field>
          {!a.personaId && <InfoMessage type="warning" description="Select a persona: without one, no contact can be sourced from your companies and pushed to your campaign." />}
          {a.type === "employeeDeparture" && <Muted>For Employee departure, the persona finds who took over the departed role's topic (e.g. the new Head of Sales or their manager).</Muted>}
        </Section>
      )}

      {a.processing === "campaign" && (
        <Section icon={fa("paper-plane")} title="Campaign configuration">
          <RadioCardGroup value={mode} onValueChange={(v) => { setMode(v); s.setDraft((d) => ({ ...d, campaign: v === "ai" ? `AI — ${d.name || t.title}` : undefined })); }} className="grid grid-cols-2 gap-base">
            <RadioCard value="ai" icon={fa("sparkles")} title="AI-powered outreach" description="Generate a ready-to-use campaign with AI-written copy tailored to your signal type and ICP" />
            <RadioCard value="link" icon={fa("link")} title="Link to an existing campaign" description="Connect signals to a campaign you've already created" />
          </RadioCardGroup>
          {mode === "link" && (
            <Select size="md" label="Campaign" placeholder="Select a campaign" value={a.campaign} isOpen={campaignOpen} onOpenChange={setCampaignOpen}>
              <DropdownMenu className="w-[360px]"><DropdownMenuList>
                {CAMPAIGNS.map((c) => <DropdownMenuItem key={c} label={c} selected={c === a.campaign} onClick={() => { s.setDraft((d) => ({ ...d, campaign: c })); setCampaignOpen(false); }} />)}
              </DropdownMenuList></DropdownMenu>
            </Select>
          )}
          {mode === "ai" && (
            <InfoMessage type="ai" title="Campaign variables of this signal" description={<>The AI copy uses the signal's custom fields, e.g. <code>{`{{signal${a.type[0].toUpperCase()}${a.type.slice(1)}Date}}`}</code>{t.forecast ? <> and <code>{`{{signal${a.type[0].toUpperCase()}${a.type.slice(1)}AiMessages}}`}</code></> : null}.</>} />
          )}
        </Section>
      )}

      {a.processing === "task" && (
        <Section icon={fa("list-check")} title="Task configuration">
          <Select size="md" label="Owner" value={TEAM.find((u) => u.id === a.ownerId)?.name} isOpen={ownerOpen} onOpenChange={setOwnerOpen}>
            <DropdownMenu className="w-[280px]"><DropdownMenuList>
              {TEAM.map((u) => <DropdownMenuItem key={u.id} label={u.name} selected={u.id === a.ownerId} onClick={() => { s.setDraft((d) => ({ ...d, ownerId: u.id })); setOwnerOpen(false); }} />)}
            </DropdownMenuList></DropdownMenu>
          </Select>
          <Muted>Task name: “Task for signal {a.name || "…"}”. <Link intent="brand" size="sm">Edit task template</Link></Muted>
        </Section>
      )}
    </div>
  );
}
