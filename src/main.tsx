import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App";
import PlaceholderPage from "./pages/PlaceholderPage";

const pages = [
  { path: "/", title: "Home" },
  { path: "/people-database", title: "People database" },
  { path: "/signals", title: "Signals" },
  { path: "/contacts", title: "Contacts" },
  { path: "/companies", title: "Companies" },
  { path: "/campaigns", title: "Campaigns" },
  { path: "/tasks", title: "Tasks" },
  { path: "/inbox", title: "Inbox" },
  { path: "/reports", title: "Reports" },
  { path: "/deliverability-hub", title: "Deliverability hub" },
  { path: "/calls", title: "Calls" },
  { path: "/meetings", title: "Meetings" },
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          {pages.map(({ path, title }) => (
            <Route key={path} path={path} element={<PlaceholderPage title={title} />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
