// Fake data for the Inbox proto. Hand-written scenarios first (one per user-feedback theme,
// see projects/inbox-q1-2027/specs.md), then generated filler for volume.
// The lemlist customer here is "Fieldbase" (fictional B2B SaaS, field-ops software).
// The signed-in rep is Alice Martin (SDR). Times are relative to "now" so the proto always looks fresh.

import type { Campaign, Conversation, Label, Message, Person, Teammate } from "./types";

// ─── Time helpers ────────────────────────────────────────────────────────────
const NOW = Date.now();
export const minAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();
export const hAgo = (h: number) => minAgo(h * 60);
export const dAgo = (d: number, h = 0) => minAgo(d * 1440 + h * 60);
export const inDays = (d: number, hour = 9) => {
  const t = new Date(NOW + d * 86_400_000);
  t.setHours(hour, 0, 0, 0);
  return t.toISOString();
};

// ─── Team ────────────────────────────────────────────────────────────────────
const tm = (id: string, firstName: string, lastName: string, role: string): Teammate => ({
  id, firstName, lastName, role,
  name: `${firstName} ${lastName}`,
  email: `${firstName.toLowerCase()}@fieldbase.io`,
  initials: `${firstName[0]}${lastName[0]}`,
});

export const team: Teammate[] = [
  tm("usr_alice", "Alice", "Martin", "SDR"),
  tm("usr_thomas", "Thomas", "Bernard", "SDR"),
  tm("usr_lucas", "Lucas", "Dubois", "AE"),
  tm("usr_emma", "Emma", "Laurent", "AE"),
  tm("usr_chloe", "Chloé", "Lefebvre", "CSM"),
  tm("usr_jules", "Jules", "Mercier", "Sales Manager"),
];
export const ME = "usr_alice";

// ─── Campaigns & labels ──────────────────────────────────────────────────────
export const campaigns: Campaign[] = [
  { id: "cmp_ops_fr", name: "Cold — Ops Directors FR", emoji: "🇫🇷" },
  { id: "cmp_vp_us", name: "Outbound — VP Operations US", emoji: "🇺🇸" },
  { id: "cmp_webinar", name: "Webinar follow-up — Field Ops 2027", emoji: "📹" },
  { id: "cmp_li_clevel", name: "LinkedIn only — C-Level", emoji: "👔" },
  { id: "cmp_trial", name: "Trial expiring — rescue", emoji: "⏳" },
  { id: "cmp_dach", name: "DACH Region Outbound", emoji: "🇩🇪" },
  { id: "cmp_competitor", name: "Competitor displacement — ServiceTitan", emoji: "⚔️" },
];

export const labels: Label[] = [
  { id: "lbl_hot", name: "Hot deal", color: "orange" },
  { id: "lbl_pricing", name: "Pricing asked", color: "amber" },
  { id: "lbl_referral", name: "Referral", color: "teal" },
  { id: "lbl_partner", name: "Partner", color: "violet" },
  { id: "lbl_enterprise", name: "Enterprise", color: "indigo" },
];

// ─── People ──────────────────────────────────────────────────────────────────
const p = (name: string, jobTitle: string, companyName: string, domain: string, extra: Partial<Person> = {}): Person => {
  const [first, ...rest] = name.split(" ");
  const last = rest.join("").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return {
    contactId: `ctc_${first.toLowerCase()}_${last}`.normalize("NFD").replace(/[̀-ͯ]/g, ""),
    name, jobTitle, companyName, companyDomain: domain,
    email: `${first.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${last}@${domain}`,
    linkedinUrl: `https://linkedin.com/in/${first.toLowerCase()}-${last}`,
    ...extra,
  };
};
const notContact = (person: Person): Person => ({ ...person, contactId: null });
const meP = (id = ME): Person => {
  const t = team.find((x) => x.id === id)!;
  return { contactId: null, name: t.name, email: t.email, companyName: "Fieldbase" };
};

// ─── Builders ────────────────────────────────────────────────────────────────
let mid = 0;
type MsgInput = Omit<Message, "id" | "convId" | "to" | "cc" | "threadId" | "userId" | "source"> &
  Partial<Pick<Message, "to" | "cc" | "threadId" | "userId" | "source">>;

function conv(c: Omit<Conversation, "participants" | "readBy" | "favoriteBy" | "labels" | "campaignIds" | "notes" | "private" | "interest" | "createdAt"> & Partial<Conversation>, msgs: MsgInput[]): { conv: Conversation; msgs: Message[] } {
  const full: Conversation = {
    participants: [], readBy: [], favoriteBy: [], labels: [], campaignIds: [], notes: [], private: false, interest: null,
    createdAt: msgs[0]?.sentAt ?? dAgo(10),
    ...c,
  };
  const out = msgs.map((m) => ({
    to: [], cc: [], threadId: `${c.id}_t1`, userId: full.ownerId, source: "campaign" as const,
    ...m,
    id: `msg_${++mid}`,
    convId: c.id,
  }));
  return { conv: full, msgs: out };
}

const scenarios: { conv: Conversation; msgs: Message[] }[] = [];

// 1 · CC added by the contact → reply all, participant panel ───────────────────
{
  const marc = p("Marc Dupuis", "VP Sales", "DataSync", "datasync.io");
  const sarah = p("Sarah Klein", "Head of Sales Ops", "DataSync", "datasync.io", { contactId: null });
  scenarios.push(conv({ id: "cv_marc", person: marc, participants: [sarah], ownerId: ME, status: "open", campaignIds: ["cmp_vp_us"], labels: ["lbl_hot"],
    ai: { interest: "interested", confidence: 0.91, reason: "Asks for a demo and loops in the person who owns tooling." } }, [
    { channel: "email", direction: "out", from: meP(), to: [marc], subject: "Field teams at DataSync", body: "Hi Marc,\n\nNoticed DataSync just opened 3 regional offices. Teams that grow that fast usually end up dispatching jobs from spreadsheets and WhatsApp groups.\n\nFieldbase gives your ops team one live board for every technician. Worth a 15 min look?\n\nAlice", sentAt: dAgo(6, 3), campaignId: "cmp_vp_us", stepName: "Step 1 · Email" },
    { channel: "email", direction: "out", from: meP(), to: [marc], subject: "Re: Field teams at DataSync", body: "Hi Marc, bumping this in case it got buried. Happy to send a 2 min video instead of a call.", sentAt: dAgo(3, 2), campaignId: "cmp_vp_us", stepName: "Step 3 · Email" },
    { channel: "email", direction: "in", from: marc, to: [meP()], cc: [sarah], subject: "Re: Field teams at DataSync", body: "Hi Alice,\n\nTiming is actually good, we're rethinking dispatch for Q1. Adding Sarah in CC, she owns our ops tooling.\n\nCould you two find 30 min next week? Sarah, over to you.\n\nMarc", sentAt: minAgo(42), campaignId: "cmp_vp_us" },
  ]));
}

// 2 · Forwarded internally, then a reply from another address (Whatagraph case) ──
{
  const julie = p("Julie Moreau", "COO", "Stackly", "stackly.com");
  const karim = p("Karim Benali", "Head of Field Operations", "Stackly", "stackly.com", { contactId: null });
  scenarios.push(conv({ id: "cv_julie", person: julie, participants: [karim], ownerId: ME, status: "open", campaignIds: ["cmp_ops_fr"],
    ai: { interest: "interested", confidence: 0.74, reason: "A colleague of the contact asks for pricing after a forward." } }, [
    { channel: "email", direction: "out", from: meP(), to: [julie], subject: "Planification des interventions chez Stackly", body: "Bonjour Julie,\n\nVos équipes terrain planifient encore les interventions à la main ? On aide des COO comme vous à gagner 6 h par semaine sur le dispatch.\n\nUn échange de 15 min la semaine prochaine ?\n\nAlice", sentAt: dAgo(5, 4), campaignId: "cmp_ops_fr", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", forwarded: true, from: julie, to: [karim], subject: "TR: Planification des interventions chez Stackly", body: "Karim, à regarder ? C'est ton sujet.", sentAt: dAgo(2, 6), campaignId: "cmp_ops_fr" },
    { channel: "email", direction: "in", from: karim, to: [meP()], cc: [julie], subject: "RE: TR: Planification des interventions chez Stackly", body: "Bonjour Alice,\n\nJulie m'a transféré votre message. On a 40 techniciens et on utilise un Excel partagé, donc oui ça m'intéresse.\n\nVous avez une grille tarifaire ? Et est-ce que ça s'intègre avec Pennylane pour la facturation ?\n\nKarim", sentAt: hAgo(3), campaignId: "cmp_ops_fr", threadId: "cv_julie_t2" },
  ]));
}

// 3 · Out of office → visible, auto-snoozed until return ─────────────────────────
{
  const anna = p("Anna Schmidt", "Leiterin Betrieb", "Gridbase", "gridbase.de");
  scenarios.push(conv({ id: "cv_anna", person: anna, ownerId: ME, status: "snoozed", snoozeUntil: inDays(4), campaignIds: ["cmp_dach"], readBy: [ME] }, [
    { channel: "email", direction: "out", from: meP(), to: [anna], subject: "Einsatzplanung bei Gridbase", body: "Hallo Anna,\n\nwie plant Ihr Team heute die Einsätze der Techniker? Fieldbase ersetzt Excel und WhatsApp durch ein Live-Board.\n\n15 Minuten nächste Woche?\n\nAlice", sentAt: dAgo(1, 5), campaignId: "cmp_dach", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", from: anna, to: [meP()], subject: "Abwesenheitsnotiz: Einsatzplanung bei Gridbase", body: "Vielen Dank für Ihre Nachricht. Ich bin bis einschließlich Montag nicht im Büro und habe keinen Zugriff auf meine E-Mails. In dringenden Fällen wenden Sie sich bitte an betrieb@gridbase.de.", sentAt: dAgo(1, 4), autoReply: { kind: "ooo", backOn: inDays(4) }, campaignId: "cmp_dach" },
  ]));
}

// 4 · Snoozed conversation that got a reply → back on top, unread ─────────────────
{
  const tom = p("Tom Richards", "Director of Operations", "ClearPath Utilities", "clearpath.com");
  scenarios.push(conv({ id: "cv_tom", person: tom, ownerId: ME, status: "open", campaignIds: ["cmp_webinar"],
    ai: { interest: "interested", confidence: 0.88, reason: "Comes back after a snooze and proposes a time." } }, [
    { channel: "email", direction: "out", from: meP(), to: [tom], subject: "Thanks for joining Field Ops 2027", body: "Hi Tom,\n\nThanks for joining the webinar yesterday. Here is the recording and the slides. You asked about offline mode for technicians: it's in the deck, slide 14.\n\nAlice", sentAt: dAgo(12), campaignId: "cmp_webinar", stepName: "Step 1 · Email", attachments: [{ name: "FieldOps2027-slides.pdf", kind: "pdf", size: "4.2 MB" }] },
    { channel: "email", direction: "in", from: tom, to: [meP()], subject: "Re: Thanks for joining Field Ops 2027", body: "Thanks Alice. Busy week with the storm outages, can you ping me again in 10 days?", sentAt: dAgo(11), campaignId: "cmp_webinar" },
    { channel: "email", direction: "in", from: tom, to: [meP()], subject: "Re: Thanks for joining Field Ops 2027", body: "Hi Alice, things calmed down. Thursday 2pm ET works for a demo, can you send an invite? Please include our IT lead, Dana.", sentAt: minAgo(18), campaignId: "cmp_webinar" },
  ]));
}

// 5 · French interested reply, AI unsure → "To classify" ─────────────────────────
{
  const lea = p("Léa Garnier", "Directrice des opérations", "Velocity.io", "velocity.io");
  scenarios.push(conv({ id: "cv_lea", person: lea, ownerId: ME, status: "open", campaignIds: ["cmp_ops_fr"],
    ai: { interest: "interested", confidence: 0.58, reason: "Positive tone but no explicit next step. French reply, lower confidence." } }, [
    { channel: "email", direction: "out", from: meP(), to: [lea], subject: "Vos techniciens chez Velocity.io", body: "Bonjour Léa,\n\nCombien de temps vos techniciens passent-ils à remplir leurs rapports d'intervention ? Chez nos clients, Fieldbase divise ce temps par deux.\n\nAlice", sentAt: dAgo(4, 2), campaignId: "cmp_ops_fr", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", from: lea, to: [meP()], subject: "Re: Vos techniciens chez Velocity.io", body: "Bonjour Alice,\n\nPourquoi pas, le sujet des rapports est un vrai irritant chez nous. Je reviens vers vous après notre comité de direction de jeudi.\n\nBonne journée,\nLéa", sentAt: hAgo(5), campaignId: "cmp_ops_fr" },
  ]));
}

// 6 · AI got it wrong ("later" read as positive) ────────────────────────────────
{
  const david = p("David Chen", "VP Field Services", "NovaTech", "novatech.com");
  scenarios.push(conv({ id: "cv_david", person: david, ownerId: ME, status: "open", campaignIds: ["cmp_vp_us"], readBy: [ME],
    ai: { interest: "interested", confidence: 0.55, reason: "Mentions a future project." } }, [
    { channel: "email", direction: "out", from: meP(), to: [david], subject: "Dispatch at NovaTech", body: "Hi David, how are your dispatchers handling the 2027 install wave?", sentAt: dAgo(3), campaignId: "cmp_vp_us", stepName: "Step 2 · Email" },
    { channel: "email", direction: "in", from: david, to: [meP()], subject: "Re: Dispatch at NovaTech", body: "Not a priority right now, budget is frozen until Q2. Ping me in March and we can talk.", sentAt: hAgo(20), campaignId: "cmp_vp_us" },
  ]));
}

// 7 · Clear not interested, high confidence ─────────────────────────────────────
{
  const ryan = p("Ryan Cooper", "Operations Manager", "PivotGrid", "pivotgrid.com");
  scenarios.push(conv({ id: "cv_ryan", person: ryan, ownerId: ME, status: "open", campaignIds: ["cmp_competitor"],
    ai: { interest: "not_interested", confidence: 0.97, reason: "Asks to be removed from the list." } }, [
    { channel: "email", direction: "out", from: meP(), to: [ryan], subject: "ServiceTitan renewal", body: "Hi Ryan, your ServiceTitan contract renews in February. Teams like yours switched to Fieldbase for half the price. Open to compare?", sentAt: dAgo(2), campaignId: "cmp_competitor", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", from: ryan, to: [meP()], subject: "Re: ServiceTitan renewal", body: "We just signed a 3-year renewal. Please remove me from your list.", sentAt: hAgo(7), campaignId: "cmp_competitor" },
  ]));
}

// 8 · Inbound LinkedIn from someone who is not a contact yet ──────────────────────
{
  const nina = notContact(p("Nina Petrova", "Head of Service Delivery", "BloomTech", "bloomtech.io", { email: undefined }));
  scenarios.push(conv({ id: "cv_nina", person: nina, ownerId: ME, status: "open", unknown: { state: "pending" },
    ai: { interest: "interested", confidence: 0.82, reason: "Writes first and asks how Fieldbase handles 200+ technicians." } }, [
    { channel: "linkedin", direction: "in", source: "external", from: nina, to: [meP()], body: "Hi Alice, I saw your post about dispatch boards. We have 200+ technicians across 4 countries and our current tool is collapsing. Do you handle multi-country teams?", sentAt: minAgo(75), threadId: "cv_nina_li" },
  ]));
}

// 9 · Unknown inbound email (demo request to Alice's mailbox) ──────────────────────
{
  const omar = notContact(p("Omar Haddad", "Founder", "KineticData", "kineticdata.co"));
  scenarios.push(conv({ id: "cv_omar", person: omar, ownerId: ME, status: "open", unknown: { state: "pending" },
    ai: { interest: "interested", confidence: 0.79, reason: "Asks for a demo, inbound." } }, [
    { channel: "email", direction: "in", source: "external", from: omar, to: [meP()], subject: "Demo request", body: "Hello,\n\nA friend at Stackly recommended Fieldbase. We are 12 technicians, growing fast. Can I get a demo this week?\n\nOmar", sentAt: hAgo(9) },
  ]));
}

// 10 · WhatsApp conversation logged outside a campaign, existing contact ───────────
{
  const hugo = p("Hugo Lambert", "Gérant", "Lambert Climatisation", "lambert-clim.fr", { phone: "+33 6 12 48 93 20" });
  scenarios.push(conv({ id: "cv_hugo", person: hugo, ownerId: ME, status: "open", campaignIds: ["cmp_trial"], interest: "interested", interestSetBy: "user",
    ai: { interest: "interested", confidence: 0.86, reason: "Asks for help to finish the trial setup." } }, [
    { channel: "email", direction: "out", from: meP(), to: [hugo], subject: "Votre essai Fieldbase se termine dans 3 jours", body: "Bonjour Hugo, votre essai se termine vendredi. Besoin d'aide pour importer vos clients ?", sentAt: dAgo(2, 1), campaignId: "cmp_trial", stepName: "Step 1 · Email" },
    { channel: "whatsapp", direction: "out", source: "external", from: meP(), to: [hugo], body: "Bonjour Hugo, c'est Alice de Fieldbase, je vous écris ici comme convenu au téléphone 🙂", sentAt: dAgo(1, 3), threadId: "cv_hugo_wa" },
    { channel: "whatsapp", direction: "in", source: "external", from: hugo, to: [meP()], body: "Top merci. J'ai importé mes 300 clients mais les adresses n'apparaissent pas sur la carte", sentAt: dAgo(1, 2), threadId: "cv_hugo_wa" },
    { channel: "whatsapp", direction: "in", source: "external", from: hugo, to: [meP()], body: "Je vous envoie le fichier", sentAt: hAgo(2), threadId: "cv_hugo_wa", attachments: [{ name: "clients-lambert-2026.xlsx", kind: "xlsx", size: "182 KB" }] },
  ]));
}

// 11 · Private LinkedIn conversation of Thomas (hidden from teammates) ───────────────
{
  const sam = p("Samuel Ortiz", "Recruiter", "TalentForge", "talentforge.com");
  // Sam was prospected by Thomas on LinkedIn, then wrote back about a job: a personal message, logged on the team.
  scenarios.push(conv({ id: "cv_sam_private", person: sam, ownerId: "usr_thomas", status: "open", private: true, campaignIds: ["cmp_li_clevel"] }, [
    { channel: "linkedin", direction: "out", from: meP("usr_thomas"), to: [sam], userId: "usr_thomas", body: "Hi Samuel, how does TalentForge staff field technicians for its clients?", sentAt: dAgo(6), campaignId: "cmp_li_clevel", stepName: "Step 2 · LinkedIn message", threadId: "cv_sam_li" },
    { channel: "linkedin", direction: "in", from: sam, to: [meP("usr_thomas")], userId: "usr_thomas", body: "Not a fit for us. But between us, are you open to new opportunities? I have an AE role in Lisbon, €85k base, that matches your profile. Happy to share details privately.", sentAt: hAgo(4), campaignId: "cmp_li_clevel", threadId: "cv_sam_li" },
  ]));
}

// 12 · Multichannel at the contact level: email + LinkedIn invite + call ────────────
{
  const claire = p("Claire Fontaine", "CEO", "Synapse Labs", "synapselabs.fr", { phone: "+33 1 84 60 22 10" });
  scenarios.push(conv({ id: "cv_claire", person: claire, ownerId: ME, status: "pending", campaignIds: ["cmp_li_clevel", "cmp_ops_fr"], readBy: [ME], interest: "interested", interestSetBy: "user", labels: ["lbl_enterprise"],
    notes: [{ id: "n1", userId: ME, body: "Decision maker. Wants a pilot on the Lyon team first (15 techs). Budget validated.", createdAt: dAgo(1, 1) }] }, [
    { channel: "linkedin", direction: "out", from: meP(), to: [claire], body: "Bonjour Claire, j'ai lu votre interview dans Maddyness sur la croissance de Synapse Labs. Ravie d'échanger !", sentAt: dAgo(9), campaignId: "cmp_li_clevel", stepName: "Step 1 · LinkedIn invite", meta: { kind: "linkedin_invite" }, threadId: "cv_claire_li" },
    { channel: "linkedin", direction: "in", from: claire, to: [meP()], body: "", sentAt: dAgo(8), campaignId: "cmp_li_clevel", meta: { kind: "linkedin_invite_accepted" }, threadId: "cv_claire_li" },
    { channel: "linkedin", direction: "out", from: meP(), to: [claire], body: "Merci pour la connexion ! Vos 60 techniciens utilisent encore le planning papier à Lyon ?", sentAt: dAgo(7), campaignId: "cmp_li_clevel", stepName: "Step 2 · LinkedIn message", threadId: "cv_claire_li" },
    { channel: "linkedin", direction: "in", from: claire, to: [meP()], body: "Oui, et c'est un enfer. Appelez-moi demain matin ?", sentAt: dAgo(6), campaignId: "cmp_li_clevel", threadId: "cv_claire_li" },
    { channel: "call", direction: "out", source: "manual", from: meP(), to: [claire], body: "", sentAt: dAgo(5), meta: { kind: "call", duration: 1140, outcome: "Connected", recordingSummary: "Claire wants a pilot with the Lyon team (15 technicians) in January. Pain: paper schedules, no proof of visit. Next step: send pilot proposal and security doc." } },
    { channel: "email", direction: "out", source: "manual", from: meP(), to: [claire], subject: "Pilote Fieldbase — équipe Lyon", body: "Bonjour Claire,\n\nComme convenu, voici la proposition de pilote pour l'équipe de Lyon et notre dossier sécurité.\n\nBelle journée,\nAlice", sentAt: dAgo(1, 2), attachments: [{ name: "Proposition-pilote-SynapseLabs.pdf", kind: "pdf", size: "1.1 MB" }, { name: "Fieldbase-security.pdf", kind: "pdf", size: "860 KB" }], threadId: "cv_claire_t2" },
  ]));
}

// 13 · Lucas's conversation: reply unread by the team while Lucas is off ─────────────
{
  const ben = p("Ben Walker", "VP Operations", "HorizonAI", "horizonai.com");
  scenarios.push(conv({ id: "cv_ben", person: ben, ownerId: "usr_lucas", status: "open", campaignIds: ["cmp_vp_us"], labels: ["lbl_pricing"],
    ai: { interest: "interested", confidence: 0.9, reason: "Asks for a quote for 80 seats." } }, [
    { channel: "email", direction: "out", from: meP("usr_lucas"), to: [ben], userId: "usr_lucas", subject: "Fieldbase for HorizonAI", body: "Hi Ben, following our call, here is the overview of the Business plan.", sentAt: dAgo(2), source: "manual" },
    { channel: "email", direction: "in", from: ben, to: [meP("usr_lucas")], userId: "usr_lucas", subject: "Re: Fieldbase for HorizonAI", body: "Hi Lucas, can you send a quote for 80 seats before Friday? Our board meets Monday.", sentAt: minAgo(130) },
  ]));
}

// 14 · Draft kept across sessions ──────────────────────────────────────────────────
{
  const sofia = p("Sofia Russo", "Responsabile Operazioni", "CoreStack", "corestack.it");
  scenarios.push(conv({ id: "cv_sofia", person: sofia, ownerId: ME, status: "open", campaignIds: ["cmp_vp_us"], readBy: [ME],
    ai: { interest: "interested", confidence: 0.83, reason: "Asks for a case study in her industry." },
    draft: { channel: "email", to: [sofia], cc: [], bcc: [], subject: "Re: Field service at CoreStack", body: "Hi Sofia,\n\nHere is the case study from Enel X's installer network. The part you asked about is on page 3:", savedAt: hAgo(26) } }, [
    { channel: "email", direction: "out", from: meP(), to: [sofia], subject: "Field service at CoreStack", body: "Hi Sofia, how do your installers report jobs today?", sentAt: dAgo(3), campaignId: "cmp_vp_us", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", from: sofia, to: [meP()], subject: "Re: Field service at CoreStack", body: "Paper forms, unfortunately. Do you have a case study with an energy company?", sentAt: dAgo(1, 4) },
  ]));
}

// 15 · Scheduled reply ───────────────────────────────────────────────────────────
{
  const lars = p("Lars Eriksson", "COO", "FjordOps", "fjordops.se");
  scenarios.push(conv({ id: "cv_lars", person: lars, ownerId: ME, status: "pending", campaignIds: ["cmp_vp_us"], readBy: [ME], interest: "interested", interestSetBy: "ai" }, [
    { channel: "email", direction: "in", from: lars, to: [meP()], subject: "Re: Scheduling at FjordOps", body: "Interesting. I'm in Oslo until Wednesday, write to me Thursday morning and I'll set up time with my team.", sentAt: dAgo(1, 6) },
    { channel: "email", direction: "out", source: "manual", from: meP(), to: [lars], subject: "Re: Scheduling at FjordOps", body: "Hi Lars, as promised: here are 3 slots for next week. Which one works for your team?", sentAt: inDays(2), scheduledFor: inDays(2) },
  ]));
}

// 16 · Email logged from Gmail, outside any campaign (organic import) ────────────────
{
  const mia = p("Mia Wong", "Procurement Lead", "TitanOps", "titanops.com");
  scenarios.push(conv({ id: "cv_mia", person: mia, ownerId: ME, status: "open", campaignIds: [],
    ai: { interest: "interested", confidence: 0.77, reason: "Procurement asks for the vendor form, the deal is moving." } }, [
    { channel: "email", direction: "out", source: "external", from: meP(), to: [mia], subject: "Fieldbase — vendor onboarding", body: "Hi Mia, Lucas told me you handle vendor onboarding. What do you need from us?", sentAt: dAgo(1, 8), threadId: "cv_mia_g" },
    { channel: "email", direction: "in", source: "external", from: mia, to: [meP()], subject: "Re: Fieldbase — vendor onboarding", body: "Hi Alice, please fill in the attached vendor form and send your W-9. Thanks!", sentAt: hAgo(6), threadId: "cv_mia_g", attachments: [{ name: "TitanOps-vendor-form.xlsx", kind: "xlsx", size: "64 KB" }] },
  ]));
}

// 17 · Referral: "talk to my colleague" → AI suggests next step ─────────────────────
{
  const paul = p("Paul Girard", "CFO", "OmniTech", "omnitech.fr");
  scenarios.push(conv({ id: "cv_paul", person: paul, ownerId: ME, status: "open", campaignIds: ["cmp_ops_fr"], labels: ["lbl_referral"],
    ai: { interest: "neutral", confidence: 0.71, reason: "Not the right person, refers to a colleague." } }, [
    { channel: "email", direction: "out", from: meP(), to: [paul], subject: "Coût des interventions chez OmniTech", body: "Bonjour Paul, savez-vous combien vous coûte une intervention ratée ?", sentAt: dAgo(2, 3), campaignId: "cmp_ops_fr", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", from: paul, to: [meP()], subject: "Re: Coût des interventions chez OmniTech", body: "Bonjour, ce n'est pas mon périmètre. Voyez plutôt avec Inès Roche, notre directrice des opérations : ines.roche@omnitech.fr", sentAt: hAgo(11) },
  ]));
}

// 18 · Two email threads with the same person, merged under one conversation ─────────
{
  const yuki = p("Yuki Tanaka", "Operations Director", "SolarStack", "solarstack.jp");
  scenarios.push(conv({ id: "cv_yuki", person: yuki, ownerId: ME, status: "open", campaignIds: ["cmp_vp_us"], readBy: [],
    ai: { interest: "interested", confidence: 0.69, reason: "Answers two emails, asks about the API." } }, [
    { channel: "email", direction: "out", from: meP(), to: [yuki], subject: "Solar installs at SolarStack", body: "Hi Yuki, how many install crews do you run?", sentAt: dAgo(8), campaignId: "cmp_vp_us", stepName: "Step 1 · Email", threadId: "cv_yuki_a" },
    { channel: "email", direction: "out", from: meP(), to: [yuki], subject: "A 2-min video for SolarStack", body: "Hi Yuki, recorded a short video of what your board would look like.", sentAt: dAgo(4), campaignId: "cmp_vp_us", stepName: "Step 3 · Video email", threadId: "cv_yuki_b" },
    { channel: "email", direction: "in", from: yuki, to: [meP()], subject: "Re: Solar installs at SolarStack", body: "We run 25 crews. Does Fieldbase have an API to sync with our ERP?", sentAt: hAgo(30), threadId: "cv_yuki_a" },
    { channel: "email", direction: "in", from: yuki, to: [meP()], subject: "Re: A 2-min video for SolarStack", body: "Nice video. Sharing with my team.", sentAt: hAgo(29), threadId: "cv_yuki_b" },
  ]));
}

// 19 · LinkedIn message replied, sms ─────────────────────────────────────────────
{
  const jake = p("Jake Morrison", "Owner", "Morrison Plumbing", "morrisonplumbing.com", { phone: "+1 512 555 0142" });
  scenarios.push(conv({ id: "cv_jake", person: jake, ownerId: ME, status: "open", campaignIds: ["cmp_trial"],
    ai: { interest: "interested", confidence: 0.81, reason: "Wants to extend the trial." } }, [
    { channel: "sms", direction: "out", from: meP(), to: [jake], body: "Hi Jake, Alice from Fieldbase. Your trial ends tomorrow, want a quick call to set up your 4 trucks?", sentAt: dAgo(1, 2), campaignId: "cmp_trial", stepName: "Step 2 · SMS" },
    { channel: "sms", direction: "in", from: jake, to: [meP()], body: "Can u extend 1 week? Was on a job site all week", sentAt: hAgo(14), campaignId: "cmp_trial" },
  ]));
}

// 20 · Thomas's conversation, Alice is a teammate (team view) ──────────────────────
{
  const eva = p("Eva Novak", "Head of Operations", "CloudForge", "cloudforge.cz");
  scenarios.push(conv({ id: "cv_eva", person: eva, ownerId: "usr_thomas", status: "open", campaignIds: ["cmp_dach"], readBy: ["usr_thomas"],
    ai: { interest: "interested", confidence: 0.64, reason: "Asks for a German-speaking contact." } }, [
    { channel: "email", direction: "out", from: meP("usr_thomas"), to: [eva], userId: "usr_thomas", subject: "Field operations at CloudForge", body: "Hi Eva, how do you dispatch your technicians across Prague and Vienna?", sentAt: dAgo(3), campaignId: "cmp_dach", stepName: "Step 1 · Email" },
    { channel: "email", direction: "in", from: eva, to: [meP("usr_thomas")], userId: "usr_thomas", subject: "Re: Field operations at CloudForge", body: "Hello Thomas, do you have someone who speaks German for the Vienna team? Then yes, let's talk.", sentAt: hAgo(8) },
  ]));
}

// ─── Generated filler (volume) ─────────────────────────────────────────────────
const FIRST = ["Olivia", "Noah", "Emma", "Liam", "Chloé", "Lucas", "Mila", "Arthur", "Jade", "Louis", "Sara", "Elias", "Maya", "Leon", "Inès", "Gabriel", "Zoé", "Raphaël", "Alba", "Jonas", "Clara", "Mateo", "Nora", "Felix"];
const LAST = ["Johnson", "Leroy", "Müller", "Rossi", "Garcia", "Petit", "Novak", "Dubois", "Smith", "Fischer", "Lopez", "Martin", "Brown", "Weber", "Moreau", "Silva", "Kowalski", "Jensen"];
const COMPANIES: [string, string][] = [["TechFlow", "techflow.io"], ["Growthly", "growthly.com"], ["Pipelinr", "pipelinr.io"], ["MetricHub", "metrichub.com"], ["SignalWave", "signalwave.io"], ["Flowstack", "flowstack.co"], ["AeroStack", "aerostack.io"], ["QuickBase", "quickbase.tech"], ["InfraLink", "infralink.com"], ["Bright Systems", "brightsystems.co"], ["SmartGrid", "smartgrid.io"], ["OptiFlow", "optiflow.com"], ["ScaleUp", "scaleup.fr"], ["NeuralPath", "neuralpath.ai"], ["SwiftOps", "swiftops.de"], ["Apex Digital", "apexdigital.com"], ["LogicWave", "logicwave.io"], ["NetPrime", "netprime.co"]];
const TITLES = ["Head of Operations", "Operations Manager", "Field Service Manager", "Directeur des opérations", "VP Operations", "Dispatch Manager", "Service Director", "COO"];
const REPLIES: { body: string; interest: "interested" | "not_interested" | "neutral"; conf: number }[] = [
  { body: "Sounds interesting, can you send more details?", interest: "interested", conf: 0.72 },
  { body: "Let's talk next week. Tuesday afternoon?", interest: "interested", conf: 0.93 },
  { body: "We already use a tool for this, thanks.", interest: "not_interested", conf: 0.88 },
  { body: "Not interested, please stop emailing me.", interest: "not_interested", conf: 0.98 },
  { body: "Merci, pas pour le moment. Recontactez-moi en septembre.", interest: "neutral", conf: 0.52 },
  { body: "Who else uses Fieldbase in our industry?", interest: "interested", conf: 0.61 },
  { body: "How much does it cost for 30 technicians?", interest: "interested", conf: 0.84 },
  { body: "I'm not the right person, try our ops team.", interest: "neutral", conf: 0.7 },
  { body: "Pouvez-vous m'envoyer une plaquette ?", interest: "interested", conf: 0.57 },
  { body: "Wir sind zufrieden mit unserer aktuellen Lösung.", interest: "not_interested", conf: 0.66 },
];
const CHANNELS = ["email", "email", "email", "linkedin", "linkedin", "whatsapp", "sms"] as const;

let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];

const filler: { conv: Conversation; msgs: Message[] }[] = [];
for (let i = 0; i < 64; i++) {
  const [company, domain] = pick(COMPANIES);
  const person = p(`${pick(FIRST)} ${pick(LAST)}`, pick(TITLES), company, domain);
  const ownerId = rnd() < 0.55 ? ME : pick(team.filter((t) => t.id !== ME && t.role !== "CSM")).id;
  const camp = pick(campaigns);
  const ch = pick(CHANNELS);
  const replied = rnd() < 0.7;
  const reply = pick(REPLIES);
  const ageH = Math.floor(rnd() * 24 * 21) + 1;
  const status = !replied ? "pending" : rnd() < 0.35 ? "done" : rnd() < 0.1 ? "snoozed" : "open";
  const read = status === "done" || rnd() < 0.5;
  const subject = ch === "email" ? pick(["Quick question about dispatch", "Field teams at " + company, "Your technicians' reports", "Planning des interventions", "Idea for " + company]) : undefined;
  const msgs: MsgInput[] = [
    { channel: ch, direction: "out", from: meP(ownerId), to: [person], userId: ownerId, subject, body: `Hi ${person.name.split(" ")[0]}, how does ${company} schedule field jobs today? We help ops teams drop spreadsheets for a live dispatch board.`, sentAt: hAgo(ageH + 48), campaignId: camp.id, stepName: "Step 1 · " + (ch === "email" ? "Email" : ch === "linkedin" ? "LinkedIn message" : ch === "whatsapp" ? "WhatsApp" : "SMS") },
  ];
  if (replied) msgs.push({ channel: ch, direction: "in", from: person, to: [meP(ownerId)], userId: ownerId, subject: subject ? `Re: ${subject}` : undefined, body: reply.body, sentAt: hAgo(ageH), campaignId: camp.id });
  filler.push(conv({
    id: `cv_gen_${i}`, person, ownerId, status, campaignIds: [camp.id],
    snoozeUntil: status === "snoozed" ? inDays(Math.ceil(rnd() * 6)) : undefined,
    readBy: read ? [ownerId, ...(rnd() < 0.3 ? [ME] : [])] : [],
    interest: status === "done" && replied ? reply.interest : null,
    interestSetBy: status === "done" && replied ? "user" : undefined,
    ai: replied ? { interest: reply.interest, confidence: reply.conf, reason: "Generated reply." } : undefined,
  }, msgs));
}

const all = [...scenarios, ...filler];
// Lot 3 rule, applied to the seed: AI sets the interest alone at 90% confidence or more (with Undo).
for (const { conv: c } of all) {
  if (!c.interest && c.ai && c.ai.confidence >= 0.9) { c.interest = c.ai.interest; c.interestSetBy = "ai"; }
}
export const seedConversations: Conversation[] = all.map((x) => x.conv);
export const seedMessages: Message[] = all.flatMap((x) => x.msgs);

/** Scenario ids, for the proto commands ("jump to scenario"). */
export const SCENARIOS: { id: string; label: string; theme: string }[] = [
  { id: "cv_marc", label: "CC added by the contact → Reply all", theme: "Reply" },
  { id: "cv_julie", label: "Forwarded, reply from another address", theme: "Threads & people" },
  { id: "cv_anna", label: "Out of office, auto-snoozed", theme: "Threads & people" },
  { id: "cv_tom", label: "Snoozed, came back with a reply", theme: "Trust" },
  { id: "cv_lea", label: "French reply, AI unsure", theme: "Triage" },
  { id: "cv_david", label: "AI wrong: 'later' read as interested", theme: "Triage" },
  { id: "cv_ryan", label: "Not interested, high confidence", theme: "Triage" },
  { id: "cv_nina", label: "Inbound LinkedIn, not a contact yet", theme: "All messages" },
  { id: "cv_omar", label: "Inbound email, not a contact yet", theme: "All messages" },
  { id: "cv_hugo", label: "WhatsApp outside campaign + XLSX", theme: "All messages" },
  { id: "cv_sam_private", label: "Thomas's private LinkedIn", theme: "Privacy" },
  { id: "cv_claire", label: "Email + LinkedIn + call, one contact", theme: "Multichannel" },
  { id: "cv_ben", label: "Lucas's reply, unread by the team", theme: "Collaboration" },
  { id: "cv_sofia", label: "Draft kept for 26 h", theme: "Reply" },
  { id: "cv_lars", label: "Scheduled reply", theme: "Reply" },
  { id: "cv_mia", label: "Logged from Gmail, no campaign", theme: "All messages" },
  { id: "cv_paul", label: "Referral to a colleague", theme: "Triage" },
  { id: "cv_yuki", label: "Two threads, one conversation", theme: "Threads & people" },
  { id: "cv_jake", label: "SMS reply", theme: "Multichannel" },
  { id: "cv_eva", label: "Thomas's conversation (team view)", theme: "Collaboration" },
];
