import { useState } from "react";
import { BrowserTab, BrowserTabItem } from "@peteryaz/ui";
import {
  faChartLineUpOutline,
  faPaperPlaneTopOutline,
  faUsersOutline,
  faClockOutline,
} from "@peteryaz/icons";

const fixedTabs = [
  { label: "Overview", icon: faChartLineUpOutline },
  { label: "Campaigns", icon: faPaperPlaneTopOutline },
  { label: "Team", icon: faUsersOutline },
  { label: "Activity", icon: faClockOutline },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [customTabs, setCustomTabs] = useState<{ label: string; icon: typeof faChartLineUpOutline }[]>([]);

  const handleAddTab = () => {
    const name = `Tab ${customTabs.length + 1}`;
    setCustomTabs([...customTabs, { label: name, icon: faChartLineUpOutline }]);
    setActiveTab(name);
  };

  const handleCloseCustomTab = (label: string) => {
    setCustomTabs(customTabs.filter((t) => t.label !== label));
    if (activeTab === label) setActiveTab("Overview");
  };

  const handleRenameCustomTab = (oldLabel: string, newLabel: string) => {
    setCustomTabs(customTabs.map((t) => (t.label === oldLabel ? { ...t, label: newLabel } : t)));
    if (activeTab === oldLabel) setActiveTab(newLabel);
  };

  return (
    <div className="flex flex-col h-full">
      <BrowserTab onAddTab={handleAddTab}>
        {fixedTabs.map((tab) => (
          <BrowserTabItem
            key={tab.label}
            icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
          />
        ))}
        {customTabs.map((tab) => (
          <BrowserTabItem
            key={tab.label}
            icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.label}
            onClick={() => setActiveTab(tab.label)}
            onClose={() => handleCloseCustomTab(tab.label)}
            onRename={(newName) => handleRenameCustomTab(tab.label, newName)}
          />
        ))}
      </BrowserTab>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-md">
          <h1 className="text-xl font-bold">{activeTab}</h1>
          <p className="text-sm text-foreground/50">Start prototyping</p>
        </div>
      </div>
    </div>
  );
}
