import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * True only on fine-pointer (mouse) devices. Starts false so SSR and the first
 * client render agree; updated after mount. Used to gate hover annotations off
 * on touch devices.
 */
export function usePointerFine(): boolean {
  return useMediaQuery("(pointer: fine)");
}

/**
 * True on devices that cannot hover (touch). Same SSR-safe shape as
 * usePointerFine. Callers gate the expanding-row fallback on
 * `useHoverNone() && !usePointerFine()` so a hybrid device reporting both a
 * mouse and a touchscreen keeps the hover cards and never gets both UIs.
 */
export function useHoverNone(): boolean {
  return useMediaQuery("(hover: none)");
}

/**
 * Starts false so SSR and the first client render agree; re-evaluated after
 * mount and kept live if the device's capabilities change.
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

interface AnnotationCardProps {
  x: number;
  y: number;
  children: ReactNode;
}

/**
 * A cursor-following annotation card. Fixed-positioned near the pointer,
 * non-interactive, clamped to stay on screen. Only ever rendered client-side
 * (in response to pointer events), so window access here is safe.
 */
/** Rough card footprint, used only to keep the card on screen. Kept in sync
 *  with the widest wrapped line (see CARD_TEXT_WRAP) and the tallest card,
 *  which is Exhibit A's: figure, share, signature, explainer, readiness, coverage. */
const CARD_W = 260;
const CARD_H = 168;

export function AnnotationCard({ x, y, children }: AnnotationCardProps) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const left = vw ? Math.min(x + 14, vw - 12 - CARD_W) : x + 14;
  const top = vh ? Math.min(y + 14, vh - 12 - CARD_H) : y + 14;

  return (
    <div
      className="pointer-events-none fixed z-50 border border-border-med bg-surface px-3 py-2 tabular-nums text-xs space-y-1 whitespace-nowrap"
      style={{ left, top }}
    >
      {children}
    </div>
  );
}

/**
 * Opt-out from the card's `whitespace-nowrap`, which exists to keep the figure
 * and signature lines intact. Prose lines must wrap instead, or a ~70-char
 * sentence stretches the card past the CARD_W the clamp above assumes and it
 * runs off the right edge of the viewport.
 */
export const CARD_TEXT_WRAP = "whitespace-normal max-w-[32ch]";

interface ExpandingRowProps {
  id: string;
  open: boolean;
  colSpan: number;
  /** Row separator, drawn below the strip. Pass false on the table's last row
   *  so it doesn't double up with the table container's own border. */
  divider: boolean;
  children: ReactNode;
}

/**
 * The touch counterpart to AnnotationCard: a strip that unfolds beneath its
 * table row, carrying the same content the hover card shows on desktop. Lives
 * in its own <tr> so the table layout stays intact.
 *
 * Height animates to the content's measured height rather than to a max-height
 * guess, so the 200ms easing matches the distance actually travelled. The
 * measurement is taken when the strip opens and on viewport resize; content
 * only reflows on those, since live data updates change the numbers in each
 * line but not the line count.
 *
 * Children stay mounted while collapsed (so the fold animates in both
 * directions) and are marked inert, keeping any links inside them out of the
 * focus order until the strip is actually open.
 */
export function ExpandingRow({
  id,
  open,
  colSpan,
  divider,
  children,
}: ExpandingRowProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = contentRef.current;
      if (el) setHeight(el.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  return (
    <tr className={divider ? "border-b border-border" : undefined}>
      <td colSpan={colSpan} className="p-0">
        <div
          id={id}
          inert={!open}
          className="overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
          style={{ height: open ? height : 0 }}
        >
          <div
            ref={contentRef}
            className="border-t border-border-med bg-surface px-3 py-2.5 tabular-nums text-xs space-y-1"
          >
            {children}
          </div>
        </div>
      </td>
    </tr>
  );
}
