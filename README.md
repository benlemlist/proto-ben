# Lemlist Proto

Boilerplate for quickly prototyping Lemlist features and UI flows.

## Stack

- **React 19** + **TypeScript**
- **Vite 7** — dev server + bundler
- **Tailwind CSS v4** — utility-first styling
- **React Router** — multi-page prototypes
- **lemDS** — Lemlist's design system (`@peteryaz/tokens`, `@peteryaz/icons`, `@peteryaz/ui`)

## Getting Started

### Prerequisites

- Node.js >= 22.12
- pnpm 9+
- GitHub token with `read:packages` scope

### Setup

1. **Add the `read:packages` scope** to your GitHub CLI token:

   ```bash
   gh auth refresh --hostname github.com --scopes read:packages
   ```

2. **Install dependencies:**

   ```bash
   GITHUB_TOKEN=$(gh auth token) pnpm install
   ```

3. **Start the dev server:**

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
gh auth refresh --hostname github.com --scopes read:packages  # first time only
GITHUB_TOKEN=$(gh auth token) pnpm install

# 4. Start prototyping
pnpm dev
```

To **sync with the latest lemDS** updates:

```bash
pnpm sync-ds
```

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
| `Badge` | Inline label (solid / light / outlined) |
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
| `Tag` | Inline tag (brand / neutral) |
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

### Quick Example

```tsx
import { Button, InfoMessage } from "@peteryaz/ui";
import { faMagnifyingGlassOutline } from "@peteryaz/icons";

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

The `.npmrc` file is configured for:
- `@peteryaz` packages → GitHub Packages (requires `GITHUB_TOKEN`)
- `@fortawesome` packages → FontAwesome Pro registry

To install new packages, prefix with the token:

```bash
GITHUB_TOKEN=$(gh auth token) pnpm add <package>
```
