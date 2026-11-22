// Floating proto control panel, shared by every page of the proto.
// - The panel lives in the app shell (App.tsx, <ProtoPanelProvider>), and can be
//   moved to any of the 4 corners of the window, or folded into a small pill.
// - A page adds its own options with <ProtoPanelSection title="…">…</ProtoPanelSection>,
//   rendered anywhere in the page: the section is portaled into the panel, so it
//   keeps the page's React context (stores, providers).
// - With no section on the current page, the panel is hidden.
// Corner and folded state are remembered per browser (localStorage).
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, faSlidersOutline, faChevronDownOutline, faChevronUpOutline } from "@l3mpire/icons";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const STORAGE_KEY = "proto-panel:v1";
const CORNER_CLASS: Record<Corner, string> = {
  "top-left": "top-lg left-lg",
  "top-right": "top-lg right-lg",
  "bottom-left": "bottom-lg left-lg",
  "bottom-right": "bottom-lg right-lg",
};
const CORNERS: Corner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

interface PanelPrefs { corner: Corner; folded: boolean }

function loadPrefs(): PanelPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PanelPrefs>;
      return { corner: CORNERS.includes(p.corner as Corner) ? (p.corner as Corner) : "bottom-left", folded: !!p.folded };
    }
  } catch { /* storage unavailable: defaults */ }
  return { corner: "bottom-left", folded: false };
}

interface Ctx { slot: HTMLDivElement | null; register: () => () => void }
const PanelContext = createContext<Ctx | null>(null);

export function ProtoPanelProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [prefs, setPrefs] = useState<PanelPrefs>(loadPrefs);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs]);

  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => c - 1);
  }, []);

  const isTop = prefs.corner.startsWith("top");

  return (
    <PanelContext.Provider value={{ slot, register }}>
      {children}
      <div
        className={`fixed z-[60] ${CORNER_CLASS[prefs.corner]} ${count === 0 ? "hidden" : ""} flex ${isTop ? "flex-col" : "flex-col-reverse"} ${prefs.corner.endsWith("right") ? "items-end" : "items-start"}`}
        data-proto-panel
      >
        {/* Header: always visible; the body opens above or below depending on the corner. */}
        <div className="flex items-center gap-xs rounded-full border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)] py-2xs pr-2xs pl-md shadow-lg">
          <button
            type="button"
            onClick={() => setPrefs((p) => ({ ...p, folded: !p.folded }))}
            className="flex items-center gap-xs text-sm leading-sm font-medium text-[var(--core-text-main-primary)]"
            title={prefs.folded ? "Show proto options" : "Hide proto options"}
          >
            <Icon icon={faSlidersOutline} size="xs" label="" />
            Proto
            <Icon icon={prefs.folded === isTop ? faChevronDownOutline : faChevronUpOutline} size="xxs" label="" className="text-[var(--core-text-main-tertiary)]" />
          </button>
          <CornerPicker corner={prefs.corner} onChange={(corner) => setPrefs((p) => ({ ...p, corner }))} />
        </div>

        <div
          ref={setSlot}
          className={`${prefs.folded ? "hidden" : "flex"} ${isTop ? "mt-xs" : "mb-xs"} max-h-[calc(100vh-120px)] w-[280px] flex-col gap-lg overflow-auto rounded-lg border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)] p-lg shadow-lg`}
        />
      </div>
    </PanelContext.Provider>
  );
}

/** 2×2 grid: click a cell to send the panel to that corner of the window. */
function CornerPicker({ corner, onChange }: { corner: Corner; onChange: (c: Corner) => void }) {
  return (
    <div className="grid grid-cols-2 gap-[2px] rounded-sm p-2xs" role="radiogroup" aria-label="Panel position">
      {CORNERS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={c === corner}
          aria-label={`Move to ${c.replace("-", " ")}`}
          title={`Move to ${c.replace("-", " ")}`}
          onClick={() => onChange(c)}
          className={`size-[9px] rounded-[2px] border transition-colors ${
            c === corner
              ? "border-[var(--core-border-main-selected)] bg-[var(--core-border-main-selected)]"
              : "border-[var(--core-border-main-primary)] bg-transparent hover:bg-[var(--core-bg-main-hover)]"
          }`}
        />
      ))}
    </div>
  );
}

/** A block of options for the current page, shown in the floating proto panel. */
export function ProtoPanelSection({ title, children }: { title: string; children: ReactNode }) {
  const ctx = useContext(PanelContext);
  const register = ctx?.register;
  useEffect(() => register?.(), [register]);
  if (!ctx?.slot) return null;
  return createPortal(
    <section className="flex flex-col gap-md">
      <h3 className="text-xs leading-xs font-semibold tracking-wide text-[var(--core-text-main-tertiary)] uppercase">{title}</h3>
      {children}
    </section>,
    ctx.slot,
  );
}
