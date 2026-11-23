// Settings shell, mirrored from lemlist prod (lempire-prod/lemapp/client/settings):
// - use-settings-modal.tsx: settings open in a `UiModal size="full"` over the app (8px inset).
// - settings-navbar.tsx: left navbar, "Account settings" then "Team settings", in prod order.
// - settings-layout.jsx (fullSize): header = tabs + close button top-right, content padded 24px.
// - data-management-settings.tsx: Data management tabs (Enrichment, Scoring, Duplicates,
//   Field updates, Website visitor). "Statuses" is the new tab of FEATURE-1804, not in prod yet.
// Icons: prod uses database / plug / server / brain-circuit…, missing from @l3mpire/icons, so the
// closest available ones stand in.
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Modal, ModalContent, ModalTitle, SidebarSettings, SidebarSection, SidebarHeadingItem, SidebarItem,
  Avatar, Tabs, TabList, TabTrigger, Button,
} from "@l3mpire/ui";
import {
  faPaperPlaneTopOutline, faBellOutline, faGaugeHighOutline, faBadgeDollarOutline, faGlobeOutline, faPhoneOutline,
  faStarsOutline, faAddressBookOutline, faLinkOutline, faHeartOutline, faCircleXmarkOutline, faClockRotateLeftOutline,
  faXmarkOutline, type IconDefinition,
} from "@l3mpire/icons";
import PlaceholderPage from "../../pages/PlaceholderPage";
import { DATA_MANAGEMENT_TABS } from "./tabs";

type NavItem = { id: string; label: string; icon: IconDefinition };

const ACCOUNT_ITEMS: NavItem[] = [
  { id: "sending", label: "Sending settings", icon: faPaperPlaneTopOutline },
  { id: "notifications", label: "Notifications", icon: faBellOutline },
  { id: "limits", label: "Limits", icon: faGaugeHighOutline },
];

const TEAM_ITEMS: NavItem[] = [
  { id: "billing", label: "Billing & Users", icon: faBadgeDollarOutline },
  { id: "sendingTeam", label: "Sending settings", icon: faPaperPlaneTopOutline },
  { id: "rulesOfEngagement", label: "Rules of engagement", icon: faPaperPlaneTopOutline },
  { id: "domains", label: "Buy domains & emails", icon: faGlobeOutline },
  { id: "voipAdmin", label: "Call settings", icon: faPhoneOutline },
  { id: "aiContextCenter", label: "AI Context Center", icon: faStarsOutline },
  { id: "dataManagement", label: "Data management", icon: faAddressBookOutline },
  { id: "integrations", label: "Integrations", icon: faLinkOutline },
  { id: "health", label: "Account health", icon: faHeartOutline },
  { id: "unsubscribes", label: "Unsubscribe", icon: faCircleXmarkOutline },
  { id: "activities", label: "Logs", icon: faClockRotateLeftOutline },
];


/** Full-screen settings modal over the app. `page` = active navbar entry. */
export function SettingsModal({ page = "dataManagement", children, overlays }: {
  page?: string;
  children: ReactNode;
  /** Toasts, proto badges…: rendered inside the modal so they stay above its overlay. */
  overlays?: ReactNode;
}) {
  const navigate = useNavigate();
  const close = () => navigate("/contacts");

  return (
    <>
      {/* The app behind the modal, as in prod (settings open on top of the current page). */}
      <PlaceholderPage title="Contacts" />
      <Modal open modal={false} onOpenChange={(o) => { if (!o) close(); }}>
        {/* modal={false} keeps the floating proto panel usable; the overlay is drawn by hand. */}
        <div className="fixed inset-0 z-50 bg-modal-overlay/50" />
        <ModalContent
          size="full"
          aria-describedby={undefined}
          onInteractOutside={(e) => e.preventDefault()}
          className="h-[calc(100%-16px)] w-[calc(100%-16px)] flex-row"
        >
          <ModalTitle className="sr-only">Settings</ModalTitle>
          <SidebarSettings className="shrink-0 overflow-y-auto border-r border-[var(--core-border-main-primary)]">
            <SidebarSection>
              <SidebarHeadingItem label="Account settings" />
              <SidebarItem avatar={<Avatar size="lg" initials="AD" />} label="Adrien Donot" />
              {ACCOUNT_ITEMS.map((i) => <SidebarItem key={i.id} icon={i.icon} label={i.label} state={i.id === page ? "active" : "default"} />)}
            </SidebarSection>
            <SidebarSection>
              <SidebarHeadingItem label="Team settings" />
              <SidebarItem avatar={<Avatar size="lg" shape="squared" initials="NF" />} label="The North Face" />
              {TEAM_ITEMS.map((i) => <SidebarItem key={i.id} icon={i.icon} label={i.label} state={i.id === page ? "active" : "default"} />)}
            </SidebarSection>
          </SidebarSettings>
          <div className="relative flex min-w-0 flex-1 flex-col bg-[var(--core-bg-main-primary)]">
            {children}
            {overlays}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

/** Prod `SettingsLayout fullSize` header for Data management: tabs, close button top-right. */
export function DataManagementHeader({ tab, onTab }: { tab: string; onTab: (id: string) => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="relative flex shrink-0 items-end border-b border-[var(--core-border-main-subtle)] pt-lg pl-lg pr-[56px]">
      <Tabs
        value={tab}
        onValueChange={(id) => {
          const route = DATA_MANAGEMENT_TABS.find((t) => t.id === id)?.route;
          if (route && route !== pathname) navigate(route);
          else onTab(id);
        }}
        className="flex-1"
      >
        <TabList>
          {DATA_MANAGEMENT_TABS.map((t) => <TabTrigger key={t.id} value={t.id}>{t.label}</TabTrigger>)}
        </TabList>
      </Tabs>
      <Button
        appearance="ghost" intent="brand" size="md" iconOnly leftIcon={faXmarkOutline} aria-label="Close settings"
        className="absolute top-lg right-lg" onClick={() => navigate("/contacts")}
      />
    </div>
  );
}
