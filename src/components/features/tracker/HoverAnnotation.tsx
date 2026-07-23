import { useEffect, useState, type ReactNode } from "react";

/**
 * True only on fine-pointer (mouse) devices. Starts false so SSR and the first
 * client render agree; updated after mount. Used to gate hover annotations off
 * on touch devices.
 */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
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
export function AnnotationCard({ x, y, children }: AnnotationCardProps) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const left = vw ? Math.min(x + 14, vw - 12 - 260) : x + 14;
  const top = vh ? Math.min(y + 14, vh - 12 - 90) : y + 14;

  return (
    <div
      className="pointer-events-none fixed z-50 border border-border-med bg-surface px-3 py-2 font-mono text-xs space-y-1 whitespace-nowrap"
      style={{ left, top }}
    >
      {children}
    </div>
  );
}
