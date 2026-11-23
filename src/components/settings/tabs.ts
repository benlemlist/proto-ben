// Data management tabs of the settings modal, prod order (data-management-settings.tsx)
// + the new "Statuses" tab (FEATURE-1804). `route` = a tab the proto designs.
export const DATA_MANAGEMENT_TABS: { id: string; label: string; route?: string }[] = [
  { id: "enrichment", label: "Enrichment" },
  { id: "leadScoring", label: "Scoring" },
  { id: "duplicates", label: "Duplicates", route: "/settings/data-management/duplicates" },
  { id: "dataIngestionRules", label: "Field updates" },
  { id: "statuses", label: "Statuses", route: "/settings/data-management/statuses" },
  { id: "visitors", label: "Website visitor" },
];
