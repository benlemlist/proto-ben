// Inbox — Q1 2027 focus. Layout: [inbox nav (lot 3)] | list | conversation + composer | contact panel.
import { useEffect } from "react";
import { Toast } from "@l3mpire/ui";
import { InboxProvider, useInbox } from "./store";
import { InboxNav } from "./components/InboxNav";
import { ConversationList } from "./components/ConversationList";
import { useListedConversations } from "./hooks";
import { ConversationView } from "./components/ConversationView";
import { ContactPanel } from "./components/ContactPanel";
import { ProtoCommands } from "./components/ProtoCommands";
import { LotsPanel } from "./components/LotsPanel";
import { protoTitle } from "../../lib/proto-identity";
import { inDays } from "./data";

export default function InboxPage() {
  return (
    <InboxProvider>
      <InboxLayout />
    </InboxProvider>
  );
}

function InboxLayout() {
  const s = useInbox();
  const list = useListedConversations();

  useEffect(() => { document.title = protoTitle("Inbox"); }, []);

  // Keyboard: ⌘⇧K proto commands (always). Lot 3 shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") { e.preventDefault(); s.setCommandsOpen(!s.commandsOpen); return; }
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable=true], [role=dialog], [role=menu]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!s.has("shortcuts")) return;
      const idx = list.findIndex((c) => c.id === s.selectedId);
      const id = s.selectedId;
      switch (e.key) {
        case "j": case "ArrowDown": if (list[idx + 1]) s.select(list[idx + 1].id); break;
        case "k": case "ArrowUp": if (idx > 0) s.select(list[idx - 1].id); break;
        case "e": if (id) { s.markDone(id); if (list[idx + 1]) s.select(list[idx + 1].id); } break;
        case "h": if (id) s.snooze(id, inDays(1, 8), "tomorrow 8:00"); break;
        case "i": if (id) s.setInterest(id, "interested"); break;
        case "n": if (id) s.setInterest(id, "not_interested"); break;
        case "u": if (id) s.setInterest(id, "neutral"); break;
        case "s": if (id) s.toggleFavorite(id); break;
        case "r": { e.preventDefault(); (document.querySelector("main textarea") as HTMLTextAreaElement | null)?.focus(); break; }
        case "?": s.toast({ type: "info", title: "Keyboard shortcuts", subtitle: "J/K next/previous · R reply · E done · H snooze · I/N/U interest · S favorite · ⌘⇧K proto commands" }); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s, list]);

  return (
    <div className="relative flex h-full min-h-0 bg-[var(--core-bg-main-primary)]">
      {s.has("left_nav") && <InboxNav />}
      <ConversationList />
      <ConversationView key={s.selectedId ?? "none"} />
      <ContactPanel />
      <ProtoCommands />

      <LotsPanel />

      <div className="pointer-events-none fixed right-xl bottom-xl z-50 flex w-[380px] flex-col gap-base">
        {s.toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto animate-fade-up">
            <Toast type={t.type} title={t.title} subtitle={t.subtitle} onClose={() => s.dismissToast(t.id)}
              actions={t.undo ? <button type="button" className="text-sm leading-sm font-medium underline" onClick={() => { t.undo!(); s.dismissToast(t.id); }}>Undo</button> : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}
