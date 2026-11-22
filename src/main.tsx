import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App";
import { installProtoIdentity } from "./lib/proto-identity";
import PlaceholderPage from "./pages/PlaceholderPage";
import Reports from "./pages/Reports";
import InboxPage from "./projects/inbox/InboxPage";
import StatusesPage from "./projects/contact-status/StatusesPage";
import DuplicatesPage from "./projects/duplicate-rules/DuplicatesPage";
import SignalsPage from "./projects/signals/SignalsPage";
import PeopleDbPage from "./projects/people-db/PeopleDbPage";

const pages = [
  { path: "/", title: "Home" },
  { path: "/contacts", title: "Contacts" },
  { path: "/companies", title: "Companies" },
  { path: "/campaigns", title: "Campaigns" },
  { path: "/tasks", title: "Tasks" },
  { path: "/deliverability-hub", title: "Deliverability hub" },
  { path: "/calls", title: "Calls" },
  { path: "/meetings", title: "Meetings" },
];

// Favicon (blue deployed, yellow local) and "Proto name · …" tab title.
installProtoIdentity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          {pages.map(({ path, title }) => (
            <Route key={path} path={path} element={<PlaceholderPage title={title} />} />
          ))}
          <Route path="/reports" element={<Reports />} />
          {/* Project: Inbox Q1 2027 (projects/inbox-q1-2027) */}
          <Route path="/inbox" element={<InboxPage />} />
          {/* Project: Dynamic contact status (projects/contact-status) */}
          <Route path="/settings/data-management/statuses" element={<StatusesPage />} />
          {/* Project: Duplicate rules (projects/duplicate-rules) */}
          <Route path="/settings/data-management/duplicates" element={<DuplicatesPage />} />
          {/* Project: New signals — Rodz sprint + Ads engagement (projects/new-signals) */}
          <Route path="/signals" element={<SignalsPage />} />
          {/* Project: PeopleDB suggested lead lists (projects/people-db) */}
          <Route path="/people-database" element={<PeopleDbPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
