import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { getDefinition } from "@/constants/glossary";
import { usePointerFine } from "./HoverAnnotation";

/** Long enough that a mouse crossing the paragraph doesn't strobe cards open. */
const OPEN_DELAY_MS = 150;
/** Clearance between the term and the card, so the card never covers the word. */
const GAP = 6;
/** Minimum breathing room from the viewport edge when clamping. */
const MARGIN = 8;
/** Hard ceiling on card width. Must match the max-w-[300px] class below — the
 *  class caps the rendering, this value keeps the clamp arithmetic honest. */
const MAX_W = 300;

interface Props {
  /** Key into GLOSSARY. Kept separate from the visible text so prose can
   *  capitalise or inflect the term without breaking the lookup. */
  term: string;
  /** Omit for terms that have no external page — those get a tooltip only. */
  href?: string;
  children: ReactNode;
}

/**
 * A term in the explainer prose that reveals its definition on hover and still
 * navigates on click (the Wikipedia-preview pattern).
 *
 * Hover is gated on fine pointers: on touch there is no hover to speak of, and
 * a tap must go straight to the link rather than being swallowed by a preview.
 *
 * The card is fixed-positioned from the term's measured rect rather than
 * absolutely positioned inside it, so the term itself stays a plain inline
 * element — a multi-word term like "multivariate polynomial cryptography" has
 * to stay free to wrap mid-phrase, which `position: relative` wrappers and
 * inline-block would both prevent.
 */
export function GlossaryTerm({ term, href, children }: Props) {
  const fine = usePointerFine();
  const definition = getDefinition(term);
  const anchorRef = useRef<HTMLElement>(null);
  // A span, not a div: the card is rendered inside a <p>, where a block-level
  // element would be illegal HTML and would break hydration.
  const cardRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Placement runs after the card has rendered, so it can measure real height
  // and flip above/below on the actual fit rather than on a guess. `pos` stays
  // null for that first pass and the card is held invisible until it resolves.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const place = () => {
      const anchor = anchorRef.current;
      const card = cardRef.current;
      if (!anchor || !card) return;
      // A term that wraps across lines has a union rect spanning both; use the
      // first client rect so the card anchors to where the term actually
      // starts rather than to a box covering two lines of the paragraph.
      const rect = anchor.getClientRects()[0] ?? anchor.getBoundingClientRect();
      const cw = Math.min(card.offsetWidth, MAX_W);
      const ch = card.offsetHeight;

      // Above by default. Flip below only when the card genuinely won't fit,
      // so it never lands on top of the line the reader is on.
      const fitsAbove = rect.top >= ch + GAP + MARGIN;
      const top = fitsAbove ? rect.top - ch - GAP : rect.bottom + GAP;
      const centered = rect.left + rect.width / 2 - cw / 2;
      const left = Math.max(
        MARGIN,
        Math.min(centered, window.innerWidth - cw - MARGIN),
      );
      setPos((prev) =>
        prev && prev.left === left && prev.top === top ? prev : { left, top },
      );
    };

    // Coalesce to one placement per frame. Placing reads layout (getClientRects,
    // offsetHeight) and then writes state, so running it per scroll event forces
    // a synchronous reflow on every event and janks — badly enough to lock up
    // the renderer during a fast scroll with a card open.
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };

    place();
    // Capture phase so the card tracks scrolling in any ancestor, not just the
    // window; both listeners are passive reads of layout.
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [open]);

  const interactive = fine && definition;

  const show = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  };
  const hide = () => {
    window.clearTimeout(timerRef.current);
    setOpen(false);
  };

  /**
   * Register 1 — definition term. A dotted rule means "annotation available"
   * and is deliberately distinct from the solid underline used for navigation
   * links, so the two are told apart at rest rather than only on hover. Text
   * colour stays text-content; only the rule brightens to flare on hover.
   */
  const termClass =
    "text-content border-b border-dotted border-content-40 hover:border-flare transition-colors";

  const handlers = interactive
    ? { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide }
    : {};

  const label = href ? (
    <a
      ref={anchorRef as React.RefObject<HTMLAnchorElement>}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={termClass}
      {...handlers}
    >
      {children}
    </a>
  ) : (
    // No external page for this term; it keeps the same underline so the
    // affordance reads consistently across the paragraph.
    <span
      ref={anchorRef as React.RefObject<HTMLSpanElement>}
      className={termClass}
      {...handlers}
    >
      {children}
    </span>
  );

  return (
    <>
      {label}
      {open && definition && (
        <span
          ref={cardRef}
          role="tooltip"
          className={`pointer-events-none fixed z-50 block w-max max-w-[300px] border border-border-med bg-surface px-3 py-2 text-xs leading-relaxed tabular-nums text-content-70 normal-case ${
            pos ? "" : "invisible"
          }`}
          // maxWidth is also set inline so the cap holds even if the utility
          // class is ever purged — this is the difference between a compact
          // card and a full-width banner across the paragraph.
          style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, maxWidth: MAX_W }}
        >
          {definition}
        </span>
      )}
    </>
  );
}
