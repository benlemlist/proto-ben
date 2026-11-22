// Floating proto control panel, shared by every page of the proto.
// - The panel lives in the app shell (App.tsx, <ProtoPanelProvider>), in dark theme
//   so it stands apart from lemlist. Drag it by its grip: it snaps to the nearest
//   of the 4 corners of the window. It folds into a small pill.
// - A page adds its own options with <ProtoPanelSection title="…">…</ProtoPanelSection>,
//   rendered anywhere in the page: the section is portaled into the panel, so it
//   keeps the page's React context (stores, providers).
// - With no section on the current page, the panel is hidden.
// Corner and folded state are remembered per browser (localStorage).
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, faGripDotsVerticalOutline, faSlidersOutline, faChevronDownOutline, faChevronUpOutline } from "@l3mpire/icons";

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
  // While dragging: the panel's top-left point (px) and the corner it will snap to.
  const [drag, setDrag] = useState<{ x: number; y: number; w: number; h: number; target: Corner } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs]);

  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => c - 1);
  }, []);

  /** The corner nearest to the panel's center. */
  const cornerAt = (x: number, y: number, w: number, h: number): Corner =>
    `${y + h / 2 < window.innerHeight / 2 ? "top" : "bottom"}-${x + w / 2 < window.innerWidth / 2 ? "left" : "right"}` as Corner;

  const onGripDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = panelRef.current?.getBoundingClientRect();
    if (!r) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    setDrag({ x: r.left, y: r.top, w: r.width, h: r.height, target: prefs.corner });
  };
  const onGripMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const x = Math.min(Math.max(e.clientX - grab.current.dx, 0), window.innerWidth - drag.w);
    const y = Math.min(Math.max(e.clientY - grab.current.dy, 0), window.innerHeight - drag.h);
    setDrag({ ...drag, x, y, target: cornerAt(x, y, drag.w, drag.h) });
  };
  const onGripUp = () => {
    if (!drag) return;
    const corner = drag.target;
    setDrag(null);
    setPrefs((p) => ({ ...p, corner }));
  };

  const isTop = prefs.corner.startsWith("top");

  return (
    <PanelContext.Provider value={{ slot, register }}>
      {children}

      {/* Where the panel will land when released. */}
      {drag && (
        <div
          className={`pointer-events-none fixed z-[59] ${CORNER_CLASS[drag.target]} rounded-lg border-2 border-dashed border-[var(--core-border-main-selected)] bg-[var(--core-bg-main-hover)] opacity-60`}
          style={{ width: drag.w, height: drag.h }}
        />
      )}

      <div
        ref={panelRef}
        data-theme="dark"
        data-proto-panel
        style={drag ? { left: drag.x, top: drag.y } : undefined}
        className={`fixed z-[60] ${drag ? "cursor-grabbing select-none" : CORNER_CLASS[prefs.corner]} ${count === 0 ? "hidden" : ""} flex ${isTop ? "flex-col" : "flex-col-reverse"} ${prefs.corner.endsWith("right") ? "items-end" : "items-start"}`}
      >
        {/* Header: always visible; the body opens above or below depending on the corner. */}
        <div className="flex items-center gap-2xs rounded-full border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)] py-2xs pr-md pl-2xs shadow-lg">
          <button
            type="button"
            onPointerDown={onGripDown}
            onPointerMove={onGripMove}
            onPointerUp={onGripUp}
            onPointerCancel={onGripUp}
            className={`flex touch-none items-center rounded-full px-2xs py-2xs text-[var(--core-text-main-tertiary)] hover:bg-[var(--core-bg-main-hover)] hover:text-[var(--core-text-main-primary)] ${drag ? "cursor-grabbing" : "cursor-grab"}`}
            title="Drag to a corner"
            aria-label="Drag the proto panel to a corner"
          >
            <Icon icon={faGripDotsVerticalOutline} size="xs" label="" />
          </button>
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
        </div>

        <div
          ref={setSlot}
          className={`${prefs.folded ? "hidden" : "flex"} ${isTop ? "mt-xs" : "mb-xs"} max-h-[calc(100vh-120px)] w-[280px] flex-col gap-lg overflow-auto rounded-lg border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-primary)] p-lg text-[var(--core-text-main-primary)] shadow-lg`}
        />
      </div>
    </PanelContext.Provider>
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
