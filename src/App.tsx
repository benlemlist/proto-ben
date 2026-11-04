import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Sidebar,
  SidebarSection,
  SidebarHeadingItem,
  SidebarItem,
  SidebarFooter,
  SearchBar,
  Avatar,
  Button,
  BadgeSpecific,
  UserMenu,
  UserMenuInfoRow,
  UserMenuSection,
  DropdownMenuItem,
} from "@l3mpire/ui";
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
  faPaperPlaneTopOutline,
  faPaperPlaneTopSolid,
  faCircleCheckOutline,
  faCircleCheckSolid,
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
  faGearOutline,
  faBadgeDollarOutline,
  faBellOutline,
  faShapesOutline,
  faBrakeWarningOutline,
  faRefreshOutline,
  faArrowRightFromBracketOutline,
  faSortSolid,
} from "@l3mpire/icons";

export default function App() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SearchBar placeholder="Search for anything" size="md" hasShortcut />

        <SidebarSection>
          <SidebarItem
            icon={faHomeOutline}
            solidIcon={faHomeSolid}
            label="Home"
            state={isActive("/") ? "active" : "default"}
            onClick={() => navigate("/")}
          />
        </SidebarSection>

        <SidebarSection>
          <SidebarHeadingItem label="Find and Manage" />
          <SidebarItem
            icon={faUsersOutline}
            solidIcon={faUsersSolid}
            label="People database"
            state={isActive("/people-database") ? "active" : "default"}
            onClick={() => navigate("/people-database")}
          />
          <SidebarItem
            icon={faBullseyeOutline}
            solidIcon={faBullseyeSolid}
            label="Signals"
            state={isActive("/signals") ? "active" : "default"}
            onClick={() => navigate("/signals")}
          />
          <SidebarItem
            icon={faAddressBookOutline}
            solidIcon={faAddressBookSolid}
            label="Contacts"
            state={isActive("/contacts") ? "active" : "default"}
            onClick={() => navigate("/contacts")}
          />
          <SidebarItem
            icon={faBuildingsOutline}
            solidIcon={faBuildingsSolid}
            label="Companies"
            state={isActive("/companies") ? "active" : "default"}
            onClick={() => navigate("/companies")}
          />
        </SidebarSection>

        <SidebarSection>
          <SidebarHeadingItem label="Engage" />
          <SidebarItem
            icon={faPaperPlaneTopOutline}
            solidIcon={faPaperPlaneTopSolid}
            label="Campaigns"
            state={isActive("/campaigns") ? "active" : "default"}
            onClick={() => navigate("/campaigns")}
          />
          <SidebarItem
            icon={faCircleCheckOutline}
            solidIcon={faCircleCheckSolid}
            label="Tasks"
            hasBadge
            badgeCount="+99"
            state={isActive("/tasks") ? "active" : "default"}
            onClick={() => navigate("/tasks")}
          />
          <SidebarItem
            icon={faInboxOutline}
            solidIcon={faInboxSolid}
            label="Inbox"
            hasBadge
            badgeCount="+99"
            state={isActive("/inbox") ? "active" : "default"}
            onClick={() => navigate("/inbox")}
          />
        </SidebarSection>

        <SidebarSection>
          <SidebarHeadingItem label="Analyze" />
          <SidebarItem
            icon={faChartLineUpOutline}
            solidIcon={faChartLineUpSolid}
            label="Reports"
            state={isActive("/reports") ? "active" : "default"}
            onClick={() => navigate("/reports")}
          />
          <SidebarItem
            icon={faGaugeHighOutline}
            solidIcon={faGaugeHighSolid}
            label="Deliverability hub"
            isNew
            state={isActive("/deliverability-hub") ? "active" : "default"}
            onClick={() => navigate("/deliverability-hub")}
          />
          <SidebarItem
            icon={faPhoneOutline}
            solidIcon={faPhoneSolid}
            label="Calls"
            state={isActive("/calls") ? "active" : "default"}
            onClick={() => navigate("/calls")}
          />
          <SidebarItem
            icon={faCalendarOutline}
            solidIcon={faCalendarSolid}
            label="Meetings"
            isNew
            state={isActive("/meetings") ? "active" : "default"}
            onClick={() => navigate("/meetings")}
          />
        </SidebarSection>

        <SidebarFooter>
          <SidebarItem
            icon={faCoinOutline}
            solidIcon={faCoinSolid}
            label="500 credits"
          />
          <div className="relative w-full">
            <SidebarItem
              avatar={<Avatar size="sm" initials="AD" />}
              label="Adrien Donot"
              hasBadge
              badgeCount="+99"
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            {showUserMenu && (
              <div className="absolute bottom-0 left-full ml-xs z-50">
                <UserMenu>
                  <UserMenuInfoRow
                    avatar={<Avatar size="xl" src="https://i.pravatar.cc/128?img=12" />}
                    name="Adrien Donot"
                    subtitle="adrien@lemlist.com"
                    action={
                      <Button
                        appearance="ghost"
                        iconOnly
                        intent="alert"
                        leftIcon={faArrowRightFromBracketOutline}
                        size="md"
                      />
                    }
                  />
                  <UserMenuSection>
                    <DropdownMenuItem icon={faGearOutline} label="Settings" />
                    <DropdownMenuItem icon={faBadgeDollarOutline} label="Plans & billing" />
                    <DropdownMenuItem icon={faGaugeHighOutline} label="Cockpit" />
                    <DropdownMenuItem
                      icon={faBellOutline}
                      label="Notifications"
                      badge={<BadgeSpecific type="notif">99</BadgeSpecific>}
                    />
                    <DropdownMenuItem icon={faShapesOutline} label="Templates" />
                    <DropdownMenuItem icon={faBrakeWarningOutline} label="Share feedback" />
                    <DropdownMenuItem
                      icon={faRefreshOutline}
                      label="Product updates"
                      badge={<BadgeSpecific type="notif">99</BadgeSpecific>}
                    />
                  </UserMenuSection>
                  <UserMenuInfoRow
                    avatar={<Avatar shape="squared" size="xl" src="https://i.pravatar.cc/128?img=50" />}
                    name="The North Face"
                    subtitle="Active plan - 12 seats"
                    action={
                      <Button
                        appearance="ghost"
                        iconOnly
                        intent="brand"
                        leftIcon={faSortSolid}
                        size="md"
                      />
                    }
                  />
                </UserMenu>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
