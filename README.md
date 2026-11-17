# Lemlist Proto

Boilerplate for quickly prototyping Lemlist features and UI flows.

## Stack

- **React 19** + **TypeScript**
- **Vite 7** — dev server + bundler
- **Tailwind CSS v4** — utility-first styling
- **React Router** — multi-page prototypes
- **lemDS** — Lemlist's design system (`@l3mpire/tokens`, `@l3mpire/icons`, `@l3mpire/ui`)

## Getting Started

### Prerequisites

- Node.js >= 22.12
- pnpm 9+

### Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start the dev server:**

   ```bash
   pnpm dev
   ```

   Open http://localhost:5173

## Start a New Prototype

This repo is a **starter template**. To create a new prototype from it:

```bash
# 1. Clone the boilerplate
git clone https://github.com/l3mpire/boilerplate-product-design.git my-prototype

# 2. Detach from the boilerplate repo
cd my-prototype
rm -rf .git
git init

# 3. Install dependencies
pnpm install

# 4. Name it: set the proto's name in index.html (see "Naming the proto" below)

# 5. Start prototyping
pnpm dev
```

### Naming the proto

Each proto names itself, so its browser tabs read apart: the tab title starts with the proto's name, and the favicon is the lemlist mark in **blue** when deployed, **yellow** on localhost. Set the name in `index.html`, in both lines:

```html
<meta name="proto-name" content="Account-based" />
<title>Account-based · lemlist</title>
```

`src/lib/proto-identity.ts` does the rest: `Account-based · lemlist` when deployed, `Account-based · local` on localhost.

To **sync with the latest lemDS** updates:

```bash
pnpm sync-ds
```

## AI (DeepSeek)

The AI features of a proto run on DeepSeek V4.1 Flash. To turn them on:

1. Copy `.env.example` to `.env.local` (git-ignored).
2. Paste one key: an OpenRouter key (starts with `sk-or-`) after `OPENROUTER_API_KEY=`, or a [DeepSeek key](https://platform.deepseek.com/api_keys) after `DEEPSEEK_API_KEY=`.
3. Restart `pnpm dev`. The terminal prints `[agent-proxy] OpenRouter key loaded` (or `DeepSeek key loaded`).

The key stays on the server side: the browser calls `/api/agent`, and the proxy (`vite-plugin-agent.ts` in dev, `api/agent.ts` on Vercel) adds the key. For a deployed proto, set the same variable in the Vercel project. With no key, each AI feature shows its mock.

In the code, every AI feature goes through `src/lib/ai` (`aiText`, `aiObject`, `aiAgent`, `aiPool`). See "AI (DeepSeek)" in `CLAUDE.md`.

## Pages & Routing

The boilerplate comes with a full Lemlist sidebar and one page per navigation item. Each page is a blank placeholder ready for prototyping.

| Route | Page |
|-------|------|
| `/` | Home |
| `/people-database` | People database |
| `/signals` | Signals |
| `/contacts` | Contacts |
| `/companies` | Companies |
| `/campaigns` | Campaigns |
| `/tasks` | Tasks |
| `/inbox` | Inbox |
| `/reports` | Reports |
| `/deliverability-hub` | Deliverability hub |
| `/calls` | Calls |
| `/meetings` | Meetings |

To add a new page, add an entry to the `pages` array in `src/main.tsx`.

## Available Components

All components from lemDS are ready to use:

| Component | Description |
|-----------|-------------|
| `Avatar` | User profile image with fallback |
| `Badge` | Inline label, outlined (`type`, `size`, `onClose` for a removable chip) |
| `BadgeSpecific` | Fixed-purpose badges: new, notification counter, locked |
| `Button` | Primary action (solid / outlined / ghost) |
| `Checkbox` | Form checkbox with label |
| `DropdownMenu` | Menu with items, headings, sections |
| `DropdownMenuItem` | Item inside a dropdown or user menu section |
| `InfoMessage` | Alert / notification banner |
| `InputLabel` | Form label with optional/mandatory indicator |
| `Link` | Text link (brand / neutral) |
| `SearchBar` | Search input with icon |
| `Select` | Custom dropdown select |
| `Sidebar` | App sidebar with sections, items, and footer |
| `SidebarSection` | Group of sidebar items with optional heading |
| `SidebarHeadingItem` | Section heading inside sidebar |
| `SidebarItem` | Navigation item with icon, label, badge, active state |
| `SidebarFooter` | Sticky footer area of sidebar |
| `Switch` | Toggle switch with label |
| `TextArea` | Multi-line text input with character limit |
| `TextInput` | Form input with icon and validation |
| `Toast` | Notification toast (info / success / alert / warning) |
| `Tooltip` | Hover tooltip (default / invert) |
| `UserMenu` | User profile menu with info rows and sections |
| `UserMenuInfoRow` | Avatar + name + subtitle row in user menu |
| `UserMenuSection` | Section of items inside user menu |
| `BrowserTab` | Chrome-like tab bar with add, drag, reorder |
| `BrowserTabItem` | Individual tab with icon, label, close, rename |
| `Tabs` | Radix-based tab container |
| `TabList` / `TabTrigger` / `TabContent` | Tab parts for building tabbed UIs |
| `ProductLogo` | Lemlist product logo |
| `Typography` | Text component with design system variants |
| `ToastProvider` | Provider for toast notifications |
| `TooltipProvider` / `TooltipTrigger` / `TooltipContent` | Radix tooltip parts |
| `Modal` | Radix-based modal dialog (sm/md/lg/full) |
| `ModalHeader` / `ModalBody` / `ModalFooter` | Modal layout sections |
| `Dialog` | Pre-composed confirmation dialog (brand/alert) |
| `SidePanel` | Full-height panel sliding from the right |
| `DataTable` | Data-driven table (TanStack Table) with sorting, filtering, pagination |
| `DataTablePagination` | Pagination controls for DataTable |
| `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableCell` | Low-level table primitives |
| `EmptyState` | Empty state illustration with title, description, action |

### Quick Example

```tsx
import { Button, InfoMessage } from "@l3mpire/ui";
import { faMagnifyingGlassOutline } from "@l3mpire/icons";

function MyPrototype() {
  return (
    <div className="flex flex-col gap-md p-lg">
      <InfoMessage
        type="warning"
        title="Sending limit reached"
        description="You've hit your daily limit."
      />
      <Button appearance="solid" intent="brand" size="md" leftIcon={faMagnifyingGlassOutline}>
        Search leads
      </Button>
    </div>
  );
}
```

## Typography

All typography uses lemDS tokens. Never hardcode font values — use these Tailwind classes:

| Class | Value |
|-------|-------|
| `text-xxs` | 10px |
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-md` | 18px |
| `text-lg` | 20px |
| `text-xl` | 24px |
| `font-regular` | 400 |
| `font-medium` | 500 |
| `font-bold` | 700 |
| `leading-2xs` | 14px |
| `leading-xs` | 16px |
| `leading-sm` | 20px |
| `leading-base` | 24px |
| `leading-md` | 28px |
| `leading-lg` | 32px |

```tsx
<h1 className="text-xl font-bold leading-lg">Dashboard</h1>
<p className="text-sm font-regular leading-sm">Campaign overview</p>
```

## Dark Mode

Add `data-theme="dark"` to the `<html>` element in `index.html`:

```html
<html lang="en" data-theme="dark">
```

## Project Structure

```
src/
├── components/    # Reusable prototype components
├── pages/         # Route pages (add new routes in main.tsx)
│   └── PlaceholderPage.tsx  # Generic placeholder used by all routes
├── lib/
│   ├── ai/        # aiText, aiObject, aiAgent, aiPool (see "AI (DeepSeek)")
│   └── agent.ts   # Transport of lib/ai (SSE reader, retries, tool loop)
├── index.css      # Global styles (lemDS + Tailwind)
├── main.tsx       # App entry + React Router + page definitions
└── App.tsx        # Root layout with sidebar + UserMenu
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build |
| `pnpm sync-ds` | Update lemDS packages to latest |

## Auth & Registry

- `@l3mpire` packages are on **npm public** — no token needed
- `@fortawesome` packages use the FontAwesome Pro registry (configured in `.npmrc`)
