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

Avatar, Badge, BrowserTab, BrowserTabItem, BulkAction, Button, Checkbox, ChipInput, DataTable, DataTablePagination, DatePicker, DatePickerCalendar, DatePickerSelects, DatePickerSuggestions, DatePickerFooter, DatePickerPanel, DatePickerRoot, DatePickerTrigger, DatePickerPopover, Dialog, DropdownMenu, DropdownMenuItem, DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadixItem, EmptyState, FilterSystem, FilterBar, FilterBarLeft, FilterBarRight, FilterChip, InteractiveFilterChip, SortButton, FilterBarButton, SaveViewButton, PropertySelector, AdvancedPopover, AdvancedChip, InfoMessage, InputLabel, Link, Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose, NumberInput, ProductLogo, RadioGroup, RadioGroupItem, RadioCard, RadioCardGroup, SearchBar, Select, SidePanel, SidePanelTrigger, SidePanelContent, SidePanelClose, Sidebar, SidebarSection, SidebarHeadingItem, SidebarItem, SidebarFooter, Switch, SwitchCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Tabs, TabList, TabTrigger, TabContent, Tag, TextArea, TextInput, Toast, ToastProvider, Tooltip, TooltipProvider, TooltipTrigger, TooltipContent, Typography, UserMenu, UserMenuInfoRow, UserMenuSection

DataTable cell components: AvatarCell, ButtonCell, DateCell, EditableCell, EmailCell, LinkCell, NumberCell, StatusCell, TextCell, RowActions

### Rules

- **ALWAYS read `node_modules/@l3mpire/ui/USAGE.md` first** when using lemDS components. This file is the single source of truth for all component APIs, props, and usage patterns. It is updated with every lemDS release.
- **ALWAYS use lemDS components** instead of raw HTML elements. Never create custom buttons, inputs, selects, toasts, etc. — use `@l3mpire/ui`.
- **ALWAYS use lemDS tokens** for spacing, colors, radius, and typography via Tailwind utilities (`p-md`, `gap-sm`, `rounded-base`) or CSS variables (`var(--spacing-md)`).
- **ALWAYS use lemDS typography tokens** — never hardcode font sizes, weights, or line heights. Use the DS values:
  - Font sizes: `text-xxs` (10px), `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-md` (18px), `text-lg` (20px), `text-xl` (24px)
  - Font weights: `font-regular` (400), `font-medium` (500), `font-bold` (700)
  - Line heights: `leading-2xs` (14px), `leading-xs` (16px), `leading-sm` (20px), `leading-base` (24px), `leading-md` (28px), `leading-lg` (32px)
- **ALWAYS use `@l3mpire/icons`** for icons — never import FontAwesome directly.
- **NEVER hardcode colors, font sizes, or spacing** — use semantic token classes or CSS variables from the design system.

### Usage Patterns

```tsx
import { Button } from "@l3mpire/ui";
import { Icon, faMagnifyingGlass } from "@l3mpire/icons";

<Button appearance="solid" intent="brand" size="md" leftIcon={faMagnifyingGlass}>
  Search
</Button>
```

### Important: Component Props

Refer to `node_modules/@l3mpire/ui/USAGE.md` for full props reference. Key notes:
- `Button` → `appearance` (solid/outlined/ghost), `intent` (brand/neutral/alert), `size` (sm/md/lg), `leftIcon`, `rightIcon`, `iconOnly`, `loading`
- `Badge` → `variant` (solid/light/outlined), `type` (primary/success/critical/warning/neutral), `size` (sm/md/lg), `icon`
- `InfoMessage` → `type` (info/success/alert/warning/empty), `title`, `description`, `onClose`, `linkLabel`, `linkHref`
- `Select` → `size`, `label`, `placeholder`, `value`, `error`, `errorMessage`, `icon`
- `TextInput` → `size`, `label`, `error`, `errorMessage`, `iconLeft`, `iconRight`, `onClear`, `hasButton`
- `SearchBar` → `variant` (white/grey), `size`, `hasShortcut`, `onClear`
- `Sidebar` → `isCollapsed`, `onCollapsedChange`. Children: SidebarSection, SidebarFooter
- `SidebarItem` → `icon`, `solidIcon`, `avatar`, `label`, `state` (default/active), `isNew`, `hasBadge`, `badgeCount`, `hasSubItems`
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
- `DropdownMenu` → Static: DropdownMenu > DropdownMenuList > DropdownMenuItem. Interactive: DropdownMenuRoot > DropdownMenuTrigger + DropdownMenuContent > DropdownMenuRadixItem
- `Tag` → `variant` (brand/neutral), `size`, `icon`, `onClose`
- `Link` → `intent` (neutral/brand/alert/success/warning), `size`, `leftIcon`, `rightIcon`
- `Avatar` → `size` (sm/md/lg/xl), `shape` (rounded/squared), `src`, `initials`
- `SidePanel` → `SidePanelTrigger` (asChild), `SidePanelContent` (overlay: boolean), `SidePanelClose`. Compose with ModalHeader/ModalBody/ModalFooter
- `DataTable` → `columns` (TanStack ColumnDef), `data`, `enableSorting`, `enableFiltering`, `enablePagination`, `enableRowSelection`, `enableColumnResizing`, `enableColumnDrag`, `bordered`, `emptyState`
- `EmptyState` → `icon`, `title`, `description`, `size` (sm/md/lg), `action` (ReactNode)
- `Table` → Low-level: Table > TableHeader > TableRow > TableHead, TableBody > TableRow > TableCell
- `ChipInput` → `size` (sm/md), `values`, `onChange`, `label`, `placeholder`, `error`, `errorMessage`, `iconLeft`, `max`. Enter creates chip, Backspace on empty removes last
- `NumberInput` → `size` (sm/md), `value`, `onChange`, `min`, `max`, `step`, `label`, `error`, `errorMessage`. Buttons auto-disable at min/max
- `RadioGroup` / `RadioGroupItem` → `value`, `onValueChange`; item: `value`, `label`, `disabled`
- `RadioCard` / `RadioCardGroup` → Card-style radio. Group: `label`, `orientation` (horizontal/vertical), `value`. Item: `value`, `title`, `description`, `icon`, `hideIndicator`
- `SwitchCard` → Card-style switch. `title`, `description`, `icon`, `checked`, `defaultChecked`, `onCheckedChange`
- `DatePicker` → Composable: `mode` (single/range), `value`, `onValueChange`. Parts: DatePickerCalendar, DatePickerPanel, DatePickerSelects, DatePickerSuggestions, DatePickerFooter, DatePickerRoot+DatePickerTrigger+DatePickerPopover
- `FilterSystem` → Top-level orchestrator. Props: `properties`, `filterState`, `onFilterStateChange`, `sortFields`, `actions`, `filterActions`, `breakpoint`. Composable parts: FilterBar, SortButton, FilterChip, InteractiveFilterChip, PropertySelector, AdvancedPopover, SaveViewButton. Auto-responsive via ResizeObserver
- `BulkAction` → Bottom-anchored selection toolbar. `count`, `onClear`, `actions` (BulkActionItem[]), `sticky` (default true), `countLabel`, `clearLabel`. Overflowing actions collapse into "…" dropdown

### Styles

Global styles are imported in `src/index.css`:
```css
@import "@l3mpire/ui/globals.css";
```

The `@source` directive in `index.css` scans `node_modules/@l3mpire/ui/dist/**/*.mjs` to detect all component utility classes for Tailwind.

All design tokens are available as CSS custom properties:
- Component tokens: `var(--comp-btn-solid-brand-bg-default)`
- Semantic tokens: `var(--core-bg-main-primary)`, `var(--core-text-main-primary)`
- Spacing: `var(--spacing-md)` (16px)
- Radius: `var(--radius-base)` (8px)
- Typography sizes: `var(--font-size-size-xxs)` (10px) → `var(--font-size-size-xl)` (24px)
- Font weights: `var(--font-weight-regular)` (400), `var(--font-weight-medium)` (500), `var(--font-weight-bold)` (700)
- Line heights: `var(--font-line-height-line-height-2xs)` (14px) → `var(--font-line-height-line-height-lg)` (32px)

Tailwind utility classes are registered: `p-md`, `gap-sm`, `rounded-base`, `text-sm`, `text-lg`, `font-medium`, `font-bold`, `leading-sm`, `leading-base`

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
