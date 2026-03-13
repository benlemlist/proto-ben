import { Outlet } from "react-router";
import {
  Sidebar,
  SidebarSection,
  SidebarHeadingItem,
  SidebarItem,
  SidebarFooter,
  SearchBar,
  Avatar,
} from "@peteryaz/ui";
import {
  faHomeOutline,
  faHomeSolid,
  faUsersOutline,
  faUsersSolid,
  faBullseyeOutline,
  faBullseyeSolid,
  faAddressBookOutline,
  faAddressBookSolid,
  faBuildingsOutline,
  faBuildingsSolid,
  faPaperPlaneOutline,
  faPaperPlaneSolid,
  faSquareCheckOutline,
  faSquareCheckSolid,
  faInboxOutline,
  faInboxSolid,
  faChartLineUpOutline,
  faChartLineUpSolid,
  faGaugeHighOutline,
  faGaugeHighSolid,
  faPhoneOutline,
  faPhoneSolid,
  faCalendarOutline,
  faCalendarSolid,
  faCoinOutline,
  faCoinSolid,
} from "@peteryaz/icons";

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarSection className="px-lg pt-lg pb-base">
          <SearchBar placeholder="Search for anything" size="md" />
        </SidebarSection>

        <SidebarSection className="px-lg">
          <SidebarItem
            icon={faHomeOutline}
            solidIcon={faHomeSolid}
            label="Home"
            state="active"
          />
        </SidebarSection>

        <SidebarSection className="px-lg pt-lg">
          <SidebarHeadingItem label="Find and Manage" />
          <SidebarItem
            icon={faUsersOutline}
            solidIcon={faUsersSolid}
            label="People database"
          />
          <SidebarItem
            icon={faBullseyeOutline}
            solidIcon={faBullseyeSolid}
            label="Signals"
          />
          <SidebarItem
            icon={faAddressBookOutline}
            solidIcon={faAddressBookSolid}
            label="Contacts"
          />
          <SidebarItem
            icon={faBuildingsOutline}
            solidIcon={faBuildingsSolid}
            label="Companies"
          />
        </SidebarSection>

        <SidebarSection className="px-lg pt-lg">
          <SidebarHeadingItem label="Engage" />
          <SidebarItem
            icon={faPaperPlaneOutline}
            solidIcon={faPaperPlaneSolid}
            label="Campaigns"
          />
          <SidebarItem
            icon={faSquareCheckOutline}
            solidIcon={faSquareCheckSolid}
            label="Tasks"
            hasBadge
            badgeCount="+99"
          />
          <SidebarItem
            icon={faInboxOutline}
            solidIcon={faInboxSolid}
            label="Inbox"
            hasBadge
            badgeCount="+99"
          />
        </SidebarSection>

        <SidebarSection className="px-lg pt-lg">
          <SidebarHeadingItem label="Analyze" />
          <SidebarItem
            icon={faChartLineUpOutline}
            solidIcon={faChartLineUpSolid}
            label="Reports"
          />
          <SidebarItem
            icon={faGaugeHighOutline}
            solidIcon={faGaugeHighSolid}
            label="Deliverability hub"
            isNew
          />
          <SidebarItem
            icon={faPhoneOutline}
            solidIcon={faPhoneSolid}
            label="Calls"
          />
          <SidebarItem
            icon={faCalendarOutline}
            solidIcon={faCalendarSolid}
            label="Meetings"
            isNew
          />
        </SidebarSection>

        <SidebarFooter>
          <SidebarItem
            icon={faCoinOutline}
            solidIcon={faCoinSolid}
            label="500 credits"
          />
          <SidebarItem
            avatar={<Avatar size="sm" initials="AD" />}
            label="Adrien Donot"
            hasBadge
            badgeCount="+99"
          />
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
