# Inbox Q1 2027 — changements priorisés, par lot

> Opportunité : [Inbox - Q1 2027 focus (FEATURE-4991)](https://app.notion.com/p/40cdfb675ef481458aa6d6111bd1a392) · Squad Productivity
> Sources croisées : 97 retours du board Product Feedback (area `inbox`, oct. 2025 → nov. 2026), audit du code prod (`l3mpire/lempire`, `lemapp/imports/lemlist/inbox/`), exploration de Maxime (`l3mpire/proto-inbox-old`, mars 2026), [Inbox vision](https://app.notion.com/p/31edfb675ef480c595a7d85d090ef2e5), [All messages (FEATURE-3797)](https://app.notion.com/p/3a3dfb675ef4800d9d9be4cef1875e69).
> Proto : route `/inbox`. Chaque lot est activable dans le proto (`⌘⇧K` → *Lot*), en cumulatif.

## Les 4 objectifs du PM, et le lot qui y répond

| Objectif | Lots |
|---|---|
| Les users n'ont plus besoin d'aller sur Gmail | 2 (répondre), 4 (tout voir) |
| Logger tous les messages, même de personnes qui ne sont pas des contacts | 4 |
| Garder le multicanal et le merge à la maille du contact | 4 (et ne rien casser dans 1 à 3) |
| Fixer le maximum de frustrations existantes | 1, puis 2, 3, 5 |

## Le principe de découpage

1. **D'abord la confiance, ensuite les nouveautés.** Tant que le non-lu, l'aperçu et l'ordre sont faux, chaque nouvelle conversation ajoutée (lot 4) aggrave le problème. Le lot 1 ne crée aucun nouveau concept et peut partir tout de suite.
2. **Le tri avant le volume.** FEATURE-3797 va faire entrer beaucoup plus de conversations (LinkedIn seul : ~2,39 M d'événements ignorés par jour aujourd'hui). La nav, les statuts et les filtres du lot 3 doivent être là avant.
3. **Chaque lot se livre seul** et laisse l'inbox dans un état cohérent.
4. **Un bug de confidentialité passe avant tout** : il est en tête du lot 1.

---

## Lot 1 — « Je peux me fier à mon inbox » (fiabilité, quick wins)

*Aucun nouveau concept, surtout du back + petits ajustements UI. Effort total estimé : M (2–3 semaines).*

| # | Changement | Pourquoi (feedback) | Constat dans le code prod | Effort |
|---|---|---|---|---|
| 1.1 | **Ne plus montrer les conversations LinkedIn / WhatsApp d'un coéquipier** sans y être autorisé (hotfix avant le modèle complet du lot 5) | Bug de confidentialité, Collaborative Drug Discovery (2 retours) | `getActivities` filtre sur `{teamId, contactId, type}` sans filtre d'expéditeur (`server/inbox.ts:1678-1687`) ; n'importe qui peut choisir n'importe quel coéquipier (`inbox-scope-service.ts:51-55`) | S |
| 1.2 | **L'aperçu montre le dernier message**, entrant ou sortant (« You: … » quand c'est nous) | 4 retours (groupe *preview*) | La ligne prend `lastRepliedMessagePreview` en priorité, même après notre réponse (`inbox-list-item-enhanced.tsx:86-98`) | XS |
| 1.3 | **Toute nouvelle réponse remonte en tête**, y compris absence, réponse d'un tiers, autre adresse | « New replies do not consistently appear at the top » | Tri `{lastRepliedAt, lastSentAt}` (`server/inbox.ts:249`) ; l'OOO ne met pas à jour `lastRepliedAt` (`inbox-module.ts:894-899`) ; un tiers met à jour une autre ligne | S |
| 1.4 | **Une réponse réveille la conversation snoozée**, quel que soit l'expéditeur et qui a snoozé | Tadata + « snoozed don't reopen » | Le snooze n'est retiré que pour l'entrée du `sendUserId` (`inbox-module.ts:678-714`) ; un non-expéditeur ne peut pas snoozer (arrayFilter `u.sender: true`) | S |
| 1.5 | **Non-lu cohérent** : même valeur par défaut ligne / bouton, compteurs justes, autres onglets rafraîchis | 4 retours (groupe *unread*) | `?? true` sur la ligne vs `?? false` sur le toggle (`inbox-list-item-enhanced.tsx:78`, `use-inbox-toggle-read.ts:53`) ; la lecture ne touche pas `lastChangedAt` (`server/inbox.ts:1102-1113`) ; Favorites et Sent only hors du refresh (`inbox-conf.ts:385`) | S |
| 1.6 | **Icône du canal** sur chaque ligne (email, LinkedIn, WhatsApp, SMS, appel) | « Show channel icon before opening » | Aucune icône dans la ligne (`inbox-list-item-enhanced.tsx`) | XS |
| 1.7 | **Les absences sont visibles** : badge « Out of office until … » sur la ligne, et la conversation se met en snooze jusqu'au retour (annulable) | 4 retours OOO (ZeroPath, NEXTGEN, Paul Fino…) — les avis divergent, d'où « visible mais rangé » | L'OOO ne touche ni non-lu, ni aperçu, ni tri (`inbox-module.ts:894-899`) | S |
| 1.8 | **Le composer ne cache plus le message** : il est dans le flux, sous le fil, et rétractable ; plus de saut de scroll à l'insertion d'un template | 3 retours (groupe *composer*) | Le composer est par-dessus le fil, compensé par un padding ≥ 120 px (`inbox-composer.tsx:35-54`) | S |
| 1.9 | **Brouillon visible et fiable** : « Draft saved · 2 min ago » dans le composer, icône brouillon sur la ligne | Printify + 1 | Les brouillons existent côté serveur (`ComposerDraftsRepository`), fiabilité de l'autosave à vérifier avec les devs (composer hors de ce module) | XS–S |
| 1.10 | **Contraste dark mode** (texte du composer, tags, champ « Create new tag ») | 3 retours | — | XS |
| 1.11 | **Notifications desktop** pour une nouvelle réponse (opt-in) | Portless, LampTwist | Aucune | S |

## Lot 2 — « Je réponds sans ouvrir Gmail »

*Effort estimé : L (4 semaines). Dépend du composer partagé (`/lemlist/composer`).*

| # | Changement | Pourquoi | Constat prod | Effort |
|---|---|---|---|---|
| 2.1 | **To, CC, BCC librement modifiables**, n'importe quelle adresse (plus seulement celles du contact) | Groupe CC : 7 retours + 3 isolés (Whatagraph, Sendo, Sesamm, Anchor Cyber) | To limité aux adresses du lead (`server/inbox.ts:2467-2481`) ; pas de BCC utilisateur (`:2662`) | M |
| 2.2 | **Reply / Reply all / Forward** sur chaque message ; Reply all par défaut quand il y a du monde en CC | 5 retours transfert (tldraw, InstaLILY AI, Dennis Bacchetta…) | Reply/Reply all existent ; aucun chemin de transfert | M |
| 2.3 | **Pièces jointes en email** (PDF, CSV, XLSX, images) | ContactOut + « send pricing PDF » | `sendEmail` n'a aucun paramètre de pièce jointe (`server/inbox.ts:2250-2264`) | M |
| 2.4 | **Programmer l'envoi** (« Send tomorrow 9:00 ») | 1 retour + parité Gmail | Rien dans les paramètres d'envoi | S |
| 2.5 | **Insérer un lien lemcal** depuis la barre du composer | 1 retour, et c'est le prochain pas le plus fréquent | — | XS |
| 2.6 | **Signatures** non filtrées dans la vue conversation ; **« View original »** pour l'email brut | Team Lemon | — | XS |

## Lot 3 — « Je trie en un clic » (workflow, intérêt, filtres)

*Effort estimé : L (4–5 semaines). C'est le lot qui doit tenir le volume du lot 4.*

| # | Changement | Pourquoi | Constat prod | Effort |
|---|---|---|---|---|
| 3.1 | **Statut piloté par les actions** (repris de Maxime) : *Open* (à toi) → *Waiting* (tu as répondu) → *Snoozed* → *Done*. Une réponse entrante ramène toujours en *Open*. « Done » remplace « Archive » | Inbox vision : « new conversation → act on it → close → comes back if anything new » | L'archive est un `deletedAt` global à l'équipe (`server/inbox.ts` `archiveInbox`) | M |
| 3.2 | **Navigation à gauche** au lieu du dropdown : vues = pré-filtres, compteurs sur les vues actives (règle de Maxime), canaux, coéquipiers, vues sauvegardées | « Inbox UI feels crowded », besoin de vues par canal (Michal Richter) | Les vues sont dans un dropdown (`inbox-list-dropdown.tsx`) ; « Team conversations » est retirée du dropdown | M |
| 3.3 | **Intérêt en 1 clic** dans l'en-tête de la conversation (Interested / Not interested / Neutral), raccourcis `I` / `N` / `U` ; possibilité de revenir à neutre | Groupe classification : 7 retours | Le cœur de l'intérêt (`leads.state`) se règle ailleurs ; l'en-tête montre le statut CRM (`inbox-contact-status.tsx`) | S |
| 3.4 | **L'IA propose, l'humain confirme** : suggestion avec niveau de confiance et raison ; appliquée seule seulement au-dessus de 90 % (avec annulation) ; vue **To classify** | Groupe IA : 7 bugs (~30 % d'erreurs sur les positifs, < 50 % en français) | Seul `aiLeadInterestScore` existe, en bannière Claap (`inbox-activity-item.tsx:60, 872-875`) | M |
| 3.5 | **Filtres manquants** : expéditeur (coéquipier), campagne, canal, sans réponse, intérêt | 6 retours (Ryan Salvino, Artaker, SMART Teams, elismack…) | Canal et intérêt existent ; campagne seulement pour le MCP ; pas d'expéditeur ni « unreplied » | S |
| 3.6 | **Actions groupées** : intérêt, Done, tag, snooze | Christian & Timbers (bulk tag) | Bulk = Snooze / Change lifecycle / Archive | S |
| 3.7 | **Raccourcis clavier** (J/K, E = Done, R = Reply, A = Reply all, F = Forward, H = Snooze) | Inbox vision « shortcuts for productivity » | Aucun | S |

## Lot 4 — « Toutes mes conversations, au même endroit » (All messages)

*Effort estimé : Huge, en plusieurs versions. Front = Productivity ; capture LinkedIn = Email x LinkedIn ; WhatsApp/SMS/appels = Campaigns x VoIP (cf. FEATURE-3797).*

| # | Changement | Pourquoi | Constat prod | Effort |
|---|---|---|---|---|
| 4.1 | **Une conversation = un contact, tous canaux, toutes sources** : campagne, manuel, et messages loggés hors lemlist (Gmail, LinkedIn, WhatsApp), avec un badge de source par message. La vue « Untracked » disparaît | NOESN, Lybra (15 comptes LinkedIn), Claap (77 BDR), « Show unlinked emails » (NeoDay) | Les emails organiques vont dans **Untracked** seulement (`inbox-module.ts:123-130`) ; sans tâche → ignoré (`inbox.md:80-81`) | L |
| 4.2 | **Les participants restent dans la conversation d'origine** : personne en CC, collègue à qui le contact a transféré, autre adresse du contact. Affichés dans l'onglet *Participants*, avec « Add as contact » | Groupe CC, « Distinguish forwarded internal emails » (2 retours), « Display replies from alternative addresses » | Avec la beta `inboxThirdPartyReply`, la réponse d'un tiers crée **un autre contact et une autre ligne** (`inbox.md:64-73`) | M |
| 4.3 | **« Not a contact yet »** : liste privée des personnes qui écrivent sans être contact (inbound LinkedIn, email, WhatsApp). Actions : *Add as contact* / *Ignore* / *Never log* | Lybra, Didero ; décision ouverte « Unknown people » de FEATURE-3797 | N'existe pas | M |
| 4.4 | **Plusieurs fils dans une même conversation** : sélecteur de fil, plus de conversation éclatée | « Confusing conversation split across multiple threads » | Le panneau de fil part de `inboxGetActivitiesByThread` sur toute l'équipe | S |
| 4.5 | **Événements LinkedIn visibles** : note d'invitation envoyée, invitation acceptée | Dash0 (2 retours) | — | S |
| 4.6 | Réglage d'équipe **Log messages for your contacts → All messages** (cf. FEATURE-3797), lien depuis l'inbox | — | Beta `organicEmailImport`, email seulement | — |

## Lot 5 — « On travaille en équipe sans se marcher dessus »

*Effort estimé : M–L.*

| # | Changement | Pourquoi | Constat prod | Effort |
|---|---|---|---|---|
| 5.1 | **Conversations privées** (LinkedIn / WhatsApp perso) : seul le propriétaire les voit ; cadenas visible | Collaborative Drug Discovery | cf. 1.1 (le hotfix) | M |
| 5.2 | **Non-lu d'équipe** : « Unread by Lucas » quand une réponse arrive sur la conversation d'un coéquipier ; vue *Team* | Jehudi / Fulpra | Le non-lu ne touche que l'entrée du `sendUserId` (`inbox-module.ts:972, 1030`) | M |
| 5.3 | **Favoris personnels** (vs « favorited by a teammate ») | 1 retour | L'étoile est d'une couleur différente quand un coéquipier l'a mise | XS |
| 5.4 | **Notes internes** sur la conversation (avec @mention) | Prépare la reprise par un AE | Notes `annotated` dans le fil | S |

## Lot 6 — L'IA dans le parcours (sans perdre la réponse humaine)

| # | Changement | Pourquoi | Effort |
|---|---|---|---|
| 6.1 | **Résumé** de la conversation (tous canaux) en tête de fil | Volume ↑ avec le lot 4 ; contexte pour lemAgent | S |
| 6.2 | **Réponse suggérée**, à relire et envoyer par l'humain | Opportunité Notion : « prévoir une place pour l'IA » | M |
| 6.3 | **Prochaine étape suggérée** : réserver un créneau (lemcal), ajouter la personne référée en campagne, créer une tâche | Référent « talk to my colleague » fréquent | M |
| 6.4 | **Catégorisation plus fiable en français** (évaluation sur un jeu de réponses FR) | < 50 % de précision FR | — |

---

## Ce que je reprends de l'exploration de Maxime

| Repris | Pas repris |
|---|---|
| Statut piloté par les actions, jamais modifié à la main (→ 3.1) | Le code (JS vanilla, 3 DOM d'en-tête dupliqués) |
| Séparer statut / tags / statut CRM du contact | Les données (marques connues, « John Smith @ Raycast ») |
| La nav = pré-filtre, les filtres = 2ᵉ couche ; vues sauvegardées | Le statut *Pending* comme destination du retour d'OOO : ici, retour en *Open* (le contact n'a pas répondu, c'est à toi d'agir) |
| Compteurs sur les vues actives, pas sur *Done* | Le multi-select de coéquipiers en haut de nav (remplacé par la section *Team*) |
| L'avertissement « X added Y to this conversation » | |
| L'en-tête d'email replié (From / To / CC au clic) | |
| Le cycle de vie OOO (snooze jusqu'au retour, badge « Back ») | |

## Ce que le proto ne couvre pas (encore)

- Export des conversations (3 retours) → hors scope Q1, à proposer au squad CRM x API avec l'API Claap.
- Import de l'historique passé (FEATURE-3797 : « from now on only »).
- Recherche plein texte.

## Questions ouvertes pour le PM

1. **OOO** : on range (snooze jusqu'au retour) par défaut, ou on laisse dans *Open* ? Le proto range, avec un bouton pour annuler.
2. **Seuil d'auto-application de l'IA** : 90 % dans le proto. À calibrer sur les données réelles.
3. **Not a contact yet** : liste privée par utilisateur (proposé) ou partagée à l'équipe ?
4. **Done vs Archive** : on renomme en prod (changement d'habitude pour 3 k users/semaine) ou on garde « Archive » avec le nouveau comportement ?
5. **Lot 1.1** : le hotfix confidentialité peut-il partir hors lot, cette semaine ?
