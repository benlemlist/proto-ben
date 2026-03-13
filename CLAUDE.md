# Lemlist Proto — Boilerplate

## Project Context

This is a **prototyping boilerplate** for Lemlist, a sales engagement platform by Lempire. It's used by product designers to quickly prototype UI flows and features.

**Stack:** React + Vite + TypeScript + Tailwind CSS v4 + React Router

## Design System — lemDS

This project uses **lemDS**, Lemlist's internal design system published on GitHub Packages under `@peteryaz`.

### Packages

| Package | Description |
|---------|-------------|
| `@peteryaz/tokens` | Design tokens (colors, spacing, typography, shadows) |
| `@peteryaz/icons` | Icon component + FontAwesome Pro icon re-exports |
| `@peteryaz/ui` | React components (Button, Badge, Toast, Select, etc.) |

### Available Components

Avatar, Badge, Button, Checkbox, DropdownMenu, DropdownMenuItem, InfoMessage, InputLabel, Link, SearchBar, Select, Sidebar, SidebarSection, SidebarHeadingItem, SidebarItem, SidebarFooter, Switch, Tag, TextArea, TextInput, Toast, Tooltip, UserMenu, UserMenuInfoRow, UserMenuSection

### Rules

- **ALWAYS use lemDS components** instead of raw HTML elements. Never create custom buttons, inputs, selects, toasts, etc. — use `@peteryaz/ui`.
- **ALWAYS use lemDS tokens** for spacing, colors, radius, and typography via Tailwind utilities (`p-md`, `gap-sm`, `rounded-base`) or CSS variables (`var(--spacing-md)`).
- **ALWAYS use lemDS typography tokens** — never hardcode font sizes, weights, or line heights. Use the DS values:
  - Font sizes: `text-xxs` (10px), `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-md` (18px), `text-lg` (20px), `text-xl` (24px)
  - Font weights: `font-regular` (400), `font-medium` (500), `font-bold` (700)
  - Line heights: `leading-2xs` (14px), `leading-xs` (16px), `leading-sm` (20px), `leading-base` (24px), `leading-md` (28px), `leading-lg` (32px)
- **ALWAYS use `@peteryaz/icons`** for icons — never import FontAwesome directly.
- **NEVER hardcode colors, font sizes, or spacing** — use semantic token classes or CSS variables from the design system.

### Usage Patterns

```tsx
import { Button } from "@peteryaz/ui";
import { Icon, faMagnifyingGlass } from "@peteryaz/icons";

<Button appearance="solid" intent="brand" size="md" leftIcon={faMagnifyingGlass}>
  Search
</Button>
```

### Important: Component Props

Some components use `type` instead of `intent` for variants. Always check the actual prop names:
- `Button` → `appearance` (solid/outlined/ghost), `intent` (brand/neutral/alert), `size` (sm/md)
- `InfoMessage` → `type` (info/success/alert/warning/empty), `title`, `description`, `onClose`, `action`
- `Select` → `size`, `label`, `labelType`, `placeholder`, `value`, `error`, `errorMessage`, children are `DropdownMenu > DropdownMenuItem`
- `Badge` → `variant` (solid/light/outlined), `type` (primary/success/critical/warning/neutral), `size` (sm/md), `icon`
- `Sidebar` → `isCollapsed`, `onCollapsedChange`, `className`. Children: SidebarSection, SidebarFooter
- `SidebarSection` → `className`. Children: SidebarHeadingItem, SidebarItem
- `SidebarHeadingItem` → `label`
- `SidebarItem` → `icon`, `solidIcon`, `avatar`, `label`, `state` (default/active), `isNew`, `hasBadge`, `badgeCount`, `onClick`
- `SidebarFooter` → `className`. Children: SidebarItem
- `UserMenu` → `className`. Children: UserMenuInfoRow, UserMenuSection
- `UserMenuInfoRow` → `avatar`, `name`, `subtitle`, `action`
- `UserMenuSection` → `className`. Children: DropdownMenuItem
- `DropdownMenuItem` → `icon`, `avatar`, `flag`, `label`, `description`, `badge`, `action`, `isActive`

### Styles

Global styles are imported in `src/index.css`:
```css
@import "@peteryaz/ui/globals.css";
```

The `@source` directive in `index.css` scans `node_modules/@peteryaz/ui/dist/**/*.mjs` to detect all component utility classes for Tailwind.

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

## Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Type-check + build
pnpm preview  # Preview production build
```

## Setup Notes

- `.npmrc` is configured for `@peteryaz` GitHub Packages registry and FontAwesome Pro
- Requires `GITHUB_TOKEN` env var with `read:packages` scope
- Run `gh auth refresh --hostname github.com --scopes read:packages` to add the scope
