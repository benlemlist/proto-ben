# Ben proto (built from the Lemlist Proto boilerplate)

## This proto
- One proto for all of Benjamin's projects. Each project: code in `src/projects/<project>/`, docs in `projects/<project>/` (`project.md`, `specs.md`, `priorities.md`), route in `src/main.tsx`. Root `project.md` / `specs.md` are the index.
- Projects: **Inbox Q1 2027** (`/inbox`, `src/projects/inbox/`, hidden proto commands on ⌘⇧K, delivery lots in `lots.ts`). **Dynamic contact status** (`/settings/data-management/statuses`, `src/projects/contact-status/`, ⌘⇧K scenarios, rules engine in `logic.ts`). **Duplicate rules** (`/settings/data-management/duplicates`, `src/projects/duplicate-rules/`, one rule model in `rules.ts` for Edouard's original modal and the simplified one, switch in the proto panel). **New signals** (`/signals`, `src/projects/signals/`, built on the prod watch-list wizard, ⌘⇧K commands). **PeopleDB suggested lists** (`/people-database`, `src/projects/people-db/`, ⌘⇧K commands, lists and lead generator in `data.ts`). **Accounts list monitoring** (`/companies`, `src/projects/accounts-monitoring/`, V1 Maxime L ↔ V2 Ben switch + scenarios in the proto panel, suggestions and credits estimate in `data.ts`).
- **Floating proto panel** (`src/lib/proto-panel.tsx`, mounted in `App.tsx`): dark theme, drag by the grip to snap to one of 4 corners, foldable. lemDS `--comp-*` tokens resolve on `:root`, so the ones used inside the panel are redeclared under `[data-proto-panel]` in `src/index.css` (add more there if a new component looks light). A page adds its options with `<ProtoPanelSection title="…">` (portaled, keeps the page's context). Inbox: delivery lots checkboxes (`src/projects/inbox/components/LotsPanel.tsx`).
- **Push to BOTH remotes on every push**: `origin` (l3mpire, for devs) and `perso` (personal, Vercel). `pnpm push:all`.
- `boilerplate` remote = Peter's boilerplate; merge its updates with `git pull boilerplate main`.

---

# Lemlist Proto — Boilerplate

## Project Context

This is a **prototyping boilerplate** for Lemlist, a sales engagement platform by Lempire. It's used by product designers to quickly prototype UI flows and features.

**Stack:** React + Vite + TypeScript + Tailwind CSS v4 + React Router

## Design System — lemDS

This project uses **lemDS**, Lemlist's internal design system published on GitHub Packages under `@l3mpire`.

### Packages

| Package | Description |
|---------|-------------|
| `@l3mpire/tokens` | Design tokens (colors, spacing, typography, shadows) |
| `@l3mpire/icons` | Icon component + FontAwesome Pro icons (loaded via Kit CDN) |
| `@l3mpire/ui` | React components (Button, Badge, Toast, Select, etc.) |

### Available Components

Avatar, Badge, BadgeSpecific, StatusPill, TagButton, BrowserTab, BrowserTabItem, BulkAction, Button, Checkbox, ChipInput, DataTable, DataTablePagination, DataTableSettingsModal, DatePicker, DatePickerCalendar, DatePickerSelects, DatePickerSuggestions, DatePickerFooter, DatePickerPanel, DatePickerRelative, DatePickerRoot, DatePickerTrigger, DatePickerPopover, Dialog, DropdownMenu, DropdownMenuList, DropdownMenuItem, DropdownMenuHeading, DropdownMenuGroup, DropdownMenuDelimiter, DropdownMenuSearch, DropdownMenuTabs, DropdownMenuInputItem, DropdownMenuEmpty, DropdownMenuFooter, DropdownMenuClear, DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadixItem, EmojiPicker, EmojiPickerPopover, EmptyState, FilterSystem, FilterBar, FilterBarLeft, FilterBarRight, FilterChip, FilterChipSegment, InteractiveFilterChip, FilterEditor, SortButton, FilterBarButton, SaveViewButton, PropertySelector, AdvancedPopover, AdvancedChip, AdvancedRow, KebabMenu, SummaryChip, HoverCard, HoverCardTrigger, HoverCardContent, InfoMessage, InlineEdit, InputLabel, Link, Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose, ModalOverlay, NumberInput, ObjectButton, ObjectLinkCell, ObjectPanelHeader, ProductLogo, RadioGroup, RadioGroupItem, RadioCard, RadioCardGroup, SearchBar, Select, SidePanel, SidePanelTrigger, SidePanelContent, SidePanelClose, Sidebar, SidebarHeader, SidebarLogoButton, SidebarSection, SidebarHeadingItem, SidebarItem, SidebarFooter, SidebarSettings, Stepper, StepperItem, StepperSeparator, Switch, SwitchCard, Table, TableHeader, TableBody, TableFooter, TableCaption, TableRow, TableHead, TableCell, Tabs, TabList, TabTrigger, TabContent, TextArea, TextInput, Toast, ToastProvider, ToastViewport, Tooltip, TooltipProvider, TooltipTrigger, TooltipContent, TruncatedText, Typography, UserMenu, UserMenuInfoRow, UserMenuSection

DataTable cell components: AvatarCell, ButtonCell, DateCell, EditableCell, EmailCell, EntityCell, LinkCell, NumberCell, StatusCell, StatusPickerCell, TextCell, RowActions, RowQuickActions

Discreet inline fields (record detail / side panel): DiscreetTextInput, DiscreetTextarea, DiscreetNumberInput, DiscreetSelect, DiscreetTags, DiscreetChipInput, DiscreetDate, DiscreetLink, DiscreetEmail, DiscreetPhone, DiscreetOwner, DiscreetSwitch

Forms: InputGroup, InputGroupItem (radio / checkbox / switch rows in one card, options under the checked one), EnrichmentButton

Filter parts and helpers: OperatorSelector, OperatorList, ValueInput, SingleSelectValueInput, MultiSelectValueInput, `OPERATORS_BY_TYPE`, `getDefaultOperator`, `createFilterWithDefaults`

Column / status / AI helpers: ScoreBadge, ColumnTypeBadge, ColumnHeaderMenu, ColumnManagerPopover, ColumnManagerTrigger, CreateFieldColumnPanel, CreateScoreColumnPanel, AICell (+ helpers `pickRunningVerb`, `AI_RUNNING_VERBS`)

**Added in lemDS 9.0 (ui):** `variant="borderless"` on `DataTable` / `Table` (Figma « Table borderless », list views: Campaigns, Tasks) with `TableSelectionHead` / `TableSelectionCell`, `TableFolderRow` (+ DataTable `folders`), borderless cells `DoneTick`, `FavoriteToggle`, `TagsPickerCell`, `TableItemHover`, `StatusPickerCell triggerStyle="item"`, `TextCell done`. A borderless DataTable pins its own columns and paints its own 48px rows. Nested menus: `DropdownMenuSub` + `DropdownMenuSubTrigger` + `DropdownMenuSubContent`.

**Added between lemDS 9.2.2 and 9.4.0 (ui):** `MultiSelect` (ready-made multi-select on `Select` + `DropdownMenu`), `Skeleton` (Figma « Loader › Skeleton ») with the `useDelayedLoading` hook, `DropdownMenuSkeleton` (skeleton rows in a menu).

**Removed in v7:** `Tag` (→ `Badge` with `onClose`). See "Migration — v7.0.0" in USAGE.md for the full Badge / Button / SearchBar / Icon / Sidebar migration tables.
**v7.2 → v8:** Select + TextInput sizes are now `xs` 24 / `sm` 28 / `md` 32 (old `sm` 32px → `md`, old `md` 40px → `md`); new `ObjectButton` / `ObjectLinkCell` / `ObjectPanelHeader`.

### Rules

- **ALWAYS read `node_modules/@l3mpire/ui/USAGE.md` first** when using lemDS components. This file is the single source of truth for all component APIs, props, and usage patterns. It is updated with every lemDS release.
- **ALWAYS use lemDS components** instead of raw HTML elements. Never create custom buttons, inputs, selects, toasts, etc. — use `@l3mpire/ui`.
- **ALWAYS use lemDS tokens** for spacing, colors, radius, and typography via Tailwind utilities (`p-md`, `gap-sm`, `rounded-base`) or CSS variables (`var(--spacing-md)`).
- **ALWAYS use lemDS typography tokens** — never hardcode font sizes, weights, or line heights. Use the DS values:
  - Font sizes (lemDS tokens 0.26+, names = Figma): `text-xs` (10px), `text-sm` (12px), `text-base` (14px), `text-md` (16px), `text-lg` (18px), `text-xl` (20px), `text-xxl` (24px)
  - Font weights: `font-regular` (400), `font-medium` (500), `font-semibold` (600), `font-solid` (700), since lemDS 6.0 (Tailwind's own `font-bold` still renders 700, prefer `font-solid`)
  - Line heights: `leading-xs` (14px), `leading-sm` (16px), `leading-base` (20px), `leading-md` (24px), `leading-lg` (28px), `leading-xl` (32px)
- **ALWAYS use `@l3mpire/icons`** for icons — never import FontAwesome directly. Icons are named `faXxxOutline` / `faXxxSolid` (e.g. `faMagnifyingGlassOutline`).
- **`Icon` `size` is container-driven** (since icons 0.9): `xxs` 12/10 · `xs` 16/12 · `sm` 20/14 · `md` 24/14 · `lg` 28/16 · `xl` 32/20 (container/glyph px). Figma « Icon / SM » = `size="sm"` 1:1. For a 16px glyph use `lg`, for 20px use `xl`.
- **NEVER hardcode colors, font sizes, or spacing** — use semantic token classes or CSS variables from the design system.
- **Icon rotation/spin animations MUST live on a parent `<span>`**, not on the `<Icon>` itself. The FA Kit script swaps `<i>` → `<svg>` via MutationObserver on every className change, which interrupts any animation applied directly to the icon (symptom: icon ticks ~90° and resets in a loop). Wrap with a stable span (`<span className="ai-icon-spin"><Icon … /></span>`).

### Usage Patterns

```tsx
import { Button } from "@l3mpire/ui";
import { Icon, faMagnifyingGlassOutline } from "@l3mpire/icons";

<Button appearance="solid" intent="brand" size="md" leftIcon={faMagnifyingGlassOutline}>
  Search
</Button>
```

### Important: Component Props

Refer to `node_modules/@l3mpire/ui/USAGE.md` for full props reference. Key notes:
- `Button` → `appearance` (solid/outlined/ghost), `intent` (brand/alert/ai), `size` (xs 24px / sm 28px / md 32px — **no more `lg`**), `leftIcon`, `rightIcon`, `iconOnly`, `badge`, `loading`, `asChild`
- `Badge` → outlined-only, **no `variant` / `tone`**. `type` (info/success/critical/warning/neutral/orange/amber/teal/cyan/sky/indigo/violet/purple/fuchsia/pink/transparent/ai), `size` (sm 20px / md 24px — table cells / lg 28px), `icon`, `onClose` (removable chip, ex-Tag)
- `BadgeSpecific` → fixed-purpose 20px badges: `type` (new/notif/locked). Use `<BadgeSpecific type="notif">99</BadgeSpecific>` for counters (never `Badge type="critical"`)
- `StatusPill` → rounded status pill, same 15 hues as Badge (no ai/transparent), `size` (sm/md/lg), `icon`, `onClose`. Rendered by StatusCell / StatusPickerCell
- `InfoMessage` → `type` (info/success/alert/warning/empty/ai), `title` (optional), `description`, `onClose` + `closeLabel`, `action` (right slot), `bottomAction` (bottom slot) or `linkLabel`/`linkHref`/`onLinkClick` (neutral underlined Link)
- `Select` → `size` (xs 24 / sm 28 / md 32), `appearance` (default/ghost), `label`, `placeholder`, `value`, `error`, `errorMessage`, `icon`, `avatar`/`flag`, `tags` + `onTagRemove` (neutral Badges with ✕, `+N` overflow), `multiCount`, `isOpen`/`onOpenChange`
- `MultiSelect` → `options` ({value, label?, sublabel?, avatar?, icon?, color?, disabled?}), `value`/`defaultValue` (string[] of ids), `onValueChange`, `mode` (instant / apply = Cancel + Apply footer), `searchable` (auto above 8 options), `showSelectAll`, `onSearchChange` + `loading` (server search, skeleton rows), `skeleton`, plus the `Select` props (`size`, `appearance`, `label`, `placeholder`, `error`…). The trigger shows the selection as Badge chips with `+N` overflow
- `Skeleton` → `type` (title / body / avatar / company / badge / block = free size via `className`). Use for the first load of an empty zone, 3 to 5 lines with variable widths. Pair with `useDelayedLoading(loading)` (shown after 250 ms, kept ≥ 450 ms)
- `DropdownMenuSkeleton` → replaces `DropdownMenuList` during a server load or search: `rows` (default 4), `checkbox`, `leading` (icon/avatar/company), `sublabel`, `description`
- `TextInput` → `size` (xs 24 / sm 28 / md 32), `label`, `status` (success/risky/error, or `error`/`success` shortcuts), `errorMessage`, `hint`, `iconLeft`, `iconRight`, `onClear`, `hasButton` + `buttonIcon`/`buttonLabel`/`onButtonClick`, `selectBefore` (prefix segment)
- `SearchBar` → `variant` (white/grey), `size` (xs 24px / sm 28px / md 32px — 40px removed), `hasShortcut`, `onClear`
- `Sidebar` → `isCollapsed`, `onCollapsedChange`, `onLogoClick` (SidebarLogoButton in header). Collapsed width = 56px. Children: SidebarSection, SidebarFooter. `SidebarSettings` = 260px variant without header/footer for settings pages
- `SidebarItem` → `icon`, `solidIcon`, `avatar`, `label`, `state` (default/hover/active/disabled), `isNew`, `hasBadge`, `badgeCount`, `isLocked` (with `state="disabled"`), `hasSubItems`. Active state is neutral (no longer blue)
- `BrowserTab` → `activeTabId`, `onTabSelect`, `onNewTab`, `onReorder`. Children: BrowserTabItem
- `BrowserTabItem` → `id`, `icon`, `label`, `onClose`
- `Tabs` → `defaultValue`. Children: TabList (with TabTrigger), TabContent
- `TabTrigger` → `value`, `badge`, `disabled`
- `Modal` → `ModalTrigger`, `ModalContent` (size: sm/md/lg/full), `ModalHeader` (onClose), `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter` (infoMessage)
- `Dialog` → `open`, `onOpenChange`, `title`, `description`, `intent` (brand/alert), `primaryLabel`, `onPrimaryAction`, `cancelLabel`
- `ProductLogo` → `product` (lemlist/lemwarm/lemcal), `size` (sm/md/lg/xl), `hasText`
- `Typography` → `variant` (h1/h2/h3/lg/md/sm/xs), `weight` (regular/medium/bold)
- `Tooltip` → wrap with TooltipProvider, use TooltipTrigger + TooltipContent (`type`: default/invert, `side`: top/right/bottom/left)
- `UserMenu` → Children: UserMenuInfoRow (avatar, name, subtitle, action), UserMenuSection (contains DropdownMenuItem)
- `DropdownMenu` → Static: DropdownMenu > DropdownMenuList > DropdownMenuItem. Interactive: DropdownMenuRoot > DropdownMenuTrigger + DropdownMenuContent > DropdownMenuList > DropdownMenuRadixItem. The frame has **no padding** — always wrap items in `DropdownMenuList`. Parts: DropdownMenuSearch (`onBack`), DropdownMenuTabs, DropdownMenuGroup, DropdownMenuDelimiter (`bleed`), DropdownMenuInputItem, DropdownMenuEmpty, DropdownMenuFooter, DropdownMenuClear
- `DropdownMenuSub` → nested menu: `DropdownMenuSub` > `DropdownMenuSubTrigger` (item props: `icon`, `label`, `value` shown before the chevron) + `DropdownMenuSubContent` (same frame, opens beside the trigger)
- `DropdownMenuItem` → `icon`, `label`, `sublabel` (inline), `description` (2nd line), `badge`, `checkbox`/`checked`, `leftSlot`, `hasChildren`, `selected` (`isActive` deprecated), `disabled`, `destructive`
- `Link` → `intent` (neutral/brand/alert/success/warning), `size`, `leftIcon`, `rightIcon`, `underlined`
- `ObjectButton` → inline link naming an object: `type` (contact/company/campaign), `label`, `src`/`initials`/`tone` or `emoji`, `pressed`. Use wherever an object is *cited* — never for the object the row/page *is* (that's `EntityCell`)
- `ObjectLinkCell` → table cell citing objects: `type`, `items` ({id,label,src?,initials?,emoji?,onClick?}), `max` (default 2, then `+N` Badge with tooltip), `activeId`, `onRun` (▶ on hover, AI columns), `quickActions`, `group="row"`, `emptyText`
- `ObjectPanelHeader` → side-panel head for Contact/Company: `type`, `name`, `src`/`initials`, `role` + `company` (ObjectButton), `hasLinkedIn`, `crm`, `onMore`/`onPrevious`/`onNext`/`onExpand`/`onClose`, slots `actions`, `tabs`
- `Avatar` → `size` (sm/md/lg/xl), `shape` (rounded/squared), `src`, `initials`
- `SidePanel` → `SidePanelTrigger` (asChild), `SidePanelContent` (overlay: boolean), `SidePanelClose`. Compose with ModalHeader/ModalBody/ModalFooter
- `DataTable` → `columns` (TanStack ColumnDef), `data`, `variant` (default / `borderless`, lemDS 9.0), `folders`, `enableSorting`, `enableFiltering`, `enablePagination`, `enableRowSelection`, `enableColumnResizing`, `enableColumnDrag`, `bordered`, `emptyState`
- `EmptyState` → `icon`, `title`, `description`, `size` (sm/md/lg), `action` (ReactNode)
- `Table` → Low-level: Table > TableHeader > TableRow > TableHead, TableBody > TableRow > TableCell. `variant="borderless"` + `TableSelectionHead` / `TableSelectionCell` for list views
- `ChipInput` → `size` (sm/md), `values`, `onChange`, `label`, `placeholder`, `error`, `errorMessage`, `iconLeft`, `max`. Enter creates chip, Backspace on empty removes last
- `NumberInput` → `size` (sm/md), `value`, `onChange`, `min`, `max`, `step`, `label`, `error`, `errorMessage`. Buttons auto-disable at min/max
- `RadioGroup` / `RadioGroupItem` → `value`, `onValueChange`; item: `value`, `label`, `disabled`
- `RadioCard` / `RadioCardGroup` → Card-style radio. Group: `label`, `orientation` (horizontal/vertical), `value`. Item: `value`, `title`, `description`, `icon`, `hideIndicator`
- `SwitchCard` → Card-style switch. `title`, `description`, `icon`, `checked`, `defaultChecked`, `onCheckedChange`
- `DatePicker` → Composable: `mode` (single/range), `value`, `onValueChange`. Parts: DatePickerCalendar, DatePickerPanel, DatePickerSelects, DatePickerSuggestions, DatePickerFooter, DatePickerRoot+DatePickerTrigger+DatePickerPopover
- `FilterSystem` → Top-level orchestrator. Props: `properties`, `filterState`, `onFilterStateChange`, `sortFields`, `actions`, `filterActions`, `breakpoint`. Composable parts: FilterBar, SortButton, FilterChip, InteractiveFilterChip, PropertySelector, AdvancedPopover, SaveViewButton. Auto-responsive via ResizeObserver
- `BulkAction` → Bottom-anchored selection toolbar. `count`, `onClear`, `actions` (BulkActionItem[]), `sticky` (default true), `countLabel`, `clearLabel`. Overflowing actions collapse into "…" dropdown
- `TruncatedText` → `<span>` that ellipsis-truncates and auto-shows a tooltip with the full content only when clipped. `children`, `tooltip` (override body), `delayDuration`. Needs a width constraint (`max-w-*`)
- `EmojiPicker` / `EmojiPickerPopover` → emoji-mart-based picker with lemDS theming + dark-mode auto-detect. `onSelect` (EmojiSelection), `locale` (en/fr), `theme`, `perLine`, `previewPosition`. Popover variant: `children` (custom trigger), `open`/`onOpenChange`, `side`/`align`. Data bundle (~150KB) dynamically imported on first mount

### Styles

Global styles are imported in `src/index.css`:
```css
@import "@l3mpire/ui/globals.css";
```

The `@source` directive in `index.css` scans `node_modules/@l3mpire/ui/dist/**/*.mjs` to detect all component utility classes for Tailwind.

All design tokens are available as CSS custom properties:
- Component tokens: `var(--comp-btn-solid-brand-bg-default)`
- Semantic tokens: `var(--core-bg-main-primary)`, `var(--core-text-main-primary)`
- Spacing: `var(--spacing-base)` (8px), `var(--spacing-xl)` (16px). Scale: `2xs` 2 · `xs` 4 · `sm` 6 · `base` 8 · `md` 10 · `lg` 12 · `xl` 16 · `2xl` 24 · `3xl` 32 · `4xl` 40 · `5xl` 48 · `6xl` 56
- Radius: `var(--radius-base)` (8px)
- Typography sizes: `var(--font-size-xs)` (10px) → `var(--font-size-xxl)` (24px)
- Font weights: `var(--font-weight-regular)` (400), `var(--font-weight-medium)` (500), `var(--font-weight-semibold)` (600), `var(--font-weight-solid)` (700)
- Line heights: `var(--font-line-height-xs)` (14px) → `var(--font-line-height-xl)` (32px)

Tailwind utility classes are registered: `p-md`, `gap-sm`, `rounded-base`, `text-sm`, `text-lg`, `font-medium`, `font-solid`, `leading-sm`, `leading-base`

### Dark Mode

Add `data-theme="dark"` to root element:
```html
<html data-theme="dark">
```

## Lemlist Product Context

### Notion Resources

When you need to understand Lemlist's product features, processes, or help content, query these Notion databases via MCP:

- **Product Documentation (CX Processes):** `https://www.notion.so/lempire/279dfb675ef48058a591c5bbf3517239`
  - Data source: `collection://262dfb67-5ef4-805f-81e4-000b66c93ac4`
  - Contains internal product docs organized by Feature (Campaign Management, Lead Management, Outreach Channels, Deliverability, AI & Automation, Analytics, Integrations, etc.)
  - Services covered: Lemlist, Lemcal, Lemwarm

- **Help Center Master Database:** `https://www.notion.so/lempire/26adfb675ef48097a3a3f234c881487b`
  - Data source: `collection://26adfb67-5ef4-8089-8016-000b0664fe87`
  - Contains published help articles organized by Main Category (Getting Started, Campaign & Outreach, Integrations, Technical Setup, Troubleshooting, Sales Academy)
  - Products: lemlist articles/snippets, lemcal, lemwarm, claap

### Key Lemlist Feature Areas

- **Campaign Management** — Creating, editing, launching sequences
- **Lead Management** — Database, segmentation, enrichment, import
- **Outreach Channels** — Email, LinkedIn, Phone, WhatsApp
- **Deliverability** — Warming, DNS, authentication, reputation
- **AI & Automation** — AI-powered features and automation
- **Analytics & Reporting** — Metrics, insights, export
- **Integrations** — CRM, API, webhooks, extensions
- **Team & Collaboration** — Users, permissions, sharing

## Project Structure

```
src/
├── components/    # Reusable prototype components
├── pages/         # Route pages (one per sidebar item)
│   └── PlaceholderPage.tsx  # Generic placeholder for all routes
├── lib/
│   ├── proto-identity.ts    # Tab title + favicon (see "Proto identity")
│   ├── ai/                  # aiText, aiObject, aiAgent, aiPool, Live AI switch (see "AI")
│   └── agent.ts             # Transport of lib/ai: SSE reader, retries, tool loop
├── index.css      # Global styles + Tailwind + lemDS
├── main.tsx       # App entry + React Router + page definitions
└── App.tsx        # Root layout with sidebar navigation + UserMenu
```

### Routing

Pages are defined in `main.tsx` as a `pages` array. Each sidebar item navigates to its route and shows an active state. To add a new page, add to the array and create a component (or use PlaceholderPage).

## Project Documentation

Every prototype built from this boilerplate maintains **two living docs** at the repo root, kept up to date as the project evolves:

- **`project.md`** — context, goals, non-goals, status, key decisions, links
- **`specs.md`** — detailed feature/screen specs (user stories, behavior, UI states, edge cases)

When starting a new project, scaffold both. When scope or behavior changes, update the relevant doc in the same change. Use the **`/project-docs`** skill (`.claude/skills/project-docs/`) to scaffold and maintain them.

## Proto identity (tab title + favicon)

Every proto tells its browser tabs apart:
- **Favicon**: the lemlist mark, **blue** on the deployed proto, **yellow** on a local dev server (`localhost`, `127.0.0.1`, LAN addresses).
- **Tab title**: the proto's name first, then `local` on a dev server, then the page or `lemlist`. For example `Account-based · lemlist`, `Account-based · local`, `Account-based · local · Cold Email - Tech Startups`.

**When you start a new proto from this boilerplate, give it its name** in `index.html`, in both lines:

```html
<meta name="proto-name" content="Account-based" />
<title>Account-based · lemlist</title>
```

`src/lib/proto-identity.ts` does the rest (`installProtoIdentity()` runs in `main.tsx`). A page that sets its own tab title calls `protoTitle(pageTitle)`, so the proto's name stays first.

## AI (DeepSeek)

Every AI feature of a proto runs on a real model, **DeepSeek V4.1 Flash**, through one stack. A new AI feature is live the moment it calls `src/lib/ai`.

```
feature (AI column, copilot, chat…)
  → src/lib/ai         aiText · aiObject · aiAgent · aiPool · isAiFallback
  → src/lib/agent.ts   SSE reader, retries, tool loop, the Live AI switch
  → POST /api/agent    vite-plugin-agent.ts (pnpm dev / preview) · api/agent.ts (Vercel edge)
  → DeepSeek           through OpenRouter, or DeepSeek's own API (both: Anthropic Messages format)
```

- **The key**: one key in `.env.local` (git-ignored, template in `.env.example`), then restart `pnpm dev`. `OPENROUTER_API_KEY` (a key that starts with `sk-or-`, used first) goes through OpenRouter. `DEEPSEEK_API_KEY` goes to DeepSeek's own API. The dev server prints `[agent-proxy] OpenRouter key loaded` (or `DeepSeek key loaded`) at start. For a deployed proto: the same variable in the Vercel project.
- **The key never goes in the client**: no `VITE_*` key, no direct call to a model provider from the browser, never a key in a committed file.
- **A deployed proto has no login on `/api/agent`**: a person who has the URL can use the key. Turn on Vercel Deployment Protection for the project, and set a spending limit on the key. The proxy limits each request (allowed fields, `max_tokens` ≤ 16 000, body ≤ 2 MB) and refuses the pages of other websites.
- **ALWAYS use `src/lib/ai`** for an AI feature. Never write a new `fetch` to a model provider.
- **ALWAYS keep a mock as the fallback**. With no key or with Live AI off, the call throws `NoKeyError`: catch it with `isAiFallback(err)` and show the mock, so the proto works for a person without a key.
- **Model**: the proxy sets the model, whatever the client asks for: `deepseek/deepseek-v4.1-flash-1017` on OpenRouter, `deepseek-flash` on DeepSeek's own API (the `OPENROUTER` and `DEEPSEEK` constants in `vite-plugin-agent.ts` and `api/agent.ts`).

```ts
import { aiObject, aiText, aiPool, isAiFallback, LEMLIST_CONTEXT, AI_STYLE } from "../lib/ai";

try {
  const out = await aiObject<{ value: string }>({
    system: `${LEMLIST_CONTEXT} ${AI_STYLE}`,
    prompt: "…",
    name: "fill_cell",
    description: "…",
    schema: { type: "object", properties: { value: { type: "string" } }, required: ["value"] },
  });
} catch (err) {
  if (!isAiFallback(err)) console.error(err);
  // the feature's mock
}
```

- **Text** → `aiText` (stream `onText` into the UI). **Structured** (a cell, a sequence, filters, a score) → `aiObject` with a JSON schema. **Multi-step with tools** → `aiAgent` (tool loop, return `PAUSE` from `onTool` to wait for the user).
- **Many rows** (AI columns, bulk) → `aiPool(items, 4, fn)`. Cap the number of rows of one run.
- **Reasoning**: off by default (fast, cheap). Pass `think: true` (`aiText`, `aiObject`) or `thinking: { type: "enabled" }` (`aiAgent`) to stream the reasoning through `onThinking`. Use it for what the user watches, not for bulk calls. The reasoning counts in `maxTokens`.
- **Live AI switch**: `setLiveAi(on)` / `useLiveAiSetting()` (`src/lib/ai/live.ts`), on by default. A proto that wants the switch in its UI binds a lemDS `Switch` to them.
- **Copy**: put `AI_STYLE` in the system prompt (plain English, short, no invented figures) and `LEMLIST_CONTEXT` when the model must know the product.

## Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Type-check + build
pnpm preview  # Preview production build
```

## Setup Notes

- `@l3mpire` packages are on **npm public** — no GitHub token or custom registry needed
- `.npmrc` only contains `shamefully-hoist=true` — no custom registries or auth tokens
- FontAwesome Pro icons are loaded at runtime via a **Kit CDN script** in `index.html` — no npm `@fortawesome/*` packages needed
- Run `pnpm sync-ds` to update lemDS packages
- AI: one key in `.env.local` (`OPENROUTER_API_KEY=` or `DEEPSEEK_API_KEY=`), see "AI (DeepSeek)"
