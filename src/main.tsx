import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App";
import { installProtoIdentity } from "./lib/proto-identity";
import PlaceholderPage from "./pages/PlaceholderPage";
import Reports from "./pages/Reports";

const pages = [
  { path: "/", title: "Home" },
  { path: "/people-database", title: "People database" },
  { path: "/signals", title: "Signals" },
  { path: "/contacts", title: "Contacts" },
  { path: "/companies", title: "Companies" },
  { path: "/campaigns", title: "Campaigns" },
  { path: "/tasks", title: "Tasks" },
  { path: "/inbox", title: "Inbox" },
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
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
