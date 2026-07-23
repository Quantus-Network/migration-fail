import { useEffect, useRef, useState } from "react";
import {
  formatMarketCap,
  formatMarketCapFull,
  formatPercentage,
} from "@/lib/format-tracker";
import type { TrackerData } from "@/types/coingecko";
import { AnnotationCard, usePointerFine } from "./HoverAnnotation";

interface Props {
  data: TrackerData | null;
  loading: boolean;
  error: string | null;
  observedAt: Date | null;
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatObserved(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hh}:${mm} UTC`;
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduce;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function isRateLimited(error: string): boolean {
  return /\b429\b/.test(error) || /rate limit/i.test(error);
}

export function PercentageHero({ data, loading, error, observedAt }: Props) {
  const reduce = usePrefersReducedMotion();
  const fine = usePointerFine();
  const [gaugeHover, setGaugeHover] = useState<{ x: number; y: number } | null>(
    null
  );

  const target = data ? 100 - data.pqPercentage : 0;

  // Count-up / tween of the monument number.
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const prevTargetRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;

    const set = (v: number) => {
      displayRef.current = v;
      setDisplay(v);
    };

    const isFirst = prevTargetRef.current === null;

    // Ignore background refreshes that returned an unchanged value — but only
    // once we've actually settled ON that value. If a prior animation's RAF was
    // cancelled by an effect cleanup before it could run (e.g. React's dev
    // double-invoke, or a remount that already has cached data on first render),
    // prevTargetRef was advanced to target while display is still stranded at 0.
    // In that case displayRef.current !== target, so we must re-animate.
    if (
      !isFirst &&
      target === prevTargetRef.current &&
      displayRef.current === target
    )
      return;

    if (reduce) {
      set(target);
      prevTargetRef.current = target;
      return;
    }

    const from = isFirst ? 0 : displayRef.current;
    const duration = isFirst ? 1200 : 300;
    prevTargetRef.current = target;
    const start = performance.now();

    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      set(from + (target - from) * easeOutCubic(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        set(target);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [data, target, reduce]);

  // Gauge draw-in: fill grows from 0 to its width on first data arrival.
  const [drawn, setDrawn] = useState(reduce);
  useEffect(() => {
    if (data && !drawn && !reduce) {
      const id = requestAnimationFrame(() => setDrawn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [data, drawn, reduce]);

  const remainingMarketCap = data ? data.totalMarketCap - data.pqMarketCap : 0;
  const observed = observedAt ?? new Date();
  const fillWidth =
    drawn && data ? `max(3px, ${data.pqPercentage}%)` : "0px";
  // Reduced motion renders the final value directly (no count-up settling).
  const shownValue = reduce ? target : display;
  const [intPart, decPart] = shownValue.toFixed(2).split(".");

  return (
    <section className="pt-16 md:pt-24 pb-24 md:pb-32">
      {error ? (
        <div className="font-mono text-flare">
          <p className="text-lg mb-2">FAILED TO LOAD DATA</p>
          {isRateLimited(error) ? (
            <p className="text-sm text-content-40 tracking-wider">
              RATE LIMITED &middot; RETRYING AUTOMATICALLY
            </p>
          ) : (
            <p className="text-sm text-content-60">{error}</p>
          )}
        </div>
      ) : loading ? (
        <div className="animate-pulse">
          <div className="h-3 w-72 max-w-full bg-content-10 mb-8" />
          <div className="h-[clamp(5rem,20vw,14.5rem)] w-[min(36rem,90%)] bg-content-10 mb-8" />
          <div className="h-5 w-full max-w-xl bg-content-10 mb-8" />
          <div className="h-2 w-full bg-content-10 mb-8" />
          <div className="h-4 w-full max-w-md bg-content-10" />
        </div>
      ) : data ? (
        <>
          {/* Kicker, doubling as the SEO h1 */}
          <h1 className="font-mono text-xs uppercase tracking-widest text-content-40 mb-8">
            Share of Crypto Market Cap Not Yet Quantum Secure
          </h1>

          {/* The monument number: digits are the object, % is the unit
              annotation. The .pixel-decay wrapper carries the
              cryptographic-decay texture; delete this <div> to remove it. */}
          <div className="pixel-decay w-fit mb-8">
            <div className="flex items-baseline font-sans font-medium text-flare leading-none text-[clamp(5rem,20vw,14.5rem)] tabular-nums">
              <span className="tracking-tighter">{intPart}</span>
              <span>.</span>
              <span className="tracking-tighter">{decPart}</span>
              <span className="ml-[0.12em] text-[0.55em]">%</span>
            </div>
          </div>

          {/* (a) Statement: the dollar figure as a true second headline,
              with the migrated consolation stat beneath it */}
          <p className="leading-tight">
            <span className="font-sans tabular-nums text-content text-3xl md:text-4xl">
              {formatMarketCapFull(remainingMarketCap)}
            </span>{" "}
            <span className="text-content-60 text-xl">still vulnerable</span>
          </p>
          <p className="mt-2 font-mono text-sm">
            <span className="text-sage">
              {formatPercentage(data.pqPercentage)}% (
              {formatMarketCap(data.pqMarketCap)})
            </span>
            <span className="text-content-40"> migrated</span>
          </p>

          {/* The gauge, between the statement line and the stamp */}
          <div className="mt-8">
            <div className="flex justify-between mb-2 font-mono text-xs">
              <span className="text-sage">
                SECURED {formatMarketCap(data.pqMarketCap)}
              </span>
              <span className="text-content-40">
                TOTAL {formatMarketCap(data.totalMarketCap)}
              </span>
            </div>
            <div
              className="h-2 bg-content-10 overflow-hidden"
              onMouseEnter={
                fine
                  ? (e) => setGaugeHover({ x: e.clientX, y: e.clientY })
                  : undefined
              }
              onMouseMove={
                fine
                  ? (e) => setGaugeHover({ x: e.clientX, y: e.clientY })
                  : undefined
              }
              onMouseLeave={fine ? () => setGaugeHover(null) : undefined}
            >
              <div
                className={`h-full bg-sage ${
                  reduce ? "" : "transition-all duration-500"
                }`}
                style={{ width: fillWidth }}
              />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs text-content-40">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* (b) The document stamp: closing rule of the hero */}
          <div className="mt-8 border-t border-border">
            <p className="font-mono text-xs tracking-wider text-content-40 py-3">
              LAST OBSERVED: {formatObserved(observed)} &middot; SOURCE:
              COINGECKO &middot; STATUS: NOT MIGRATED
            </p>
          </div>

          {fine && gaugeHover && (
            <AnnotationCard x={gaugeHover.x} y={gaugeHover.y}>
              <div className="text-sage">
                SECURED {formatMarketCapFull(data.pqMarketCap)}
              </div>
              <div className="text-content-60">
                TOTAL {formatMarketCapFull(data.totalMarketCap)}
              </div>
            </AnnotationCard>
          )}
        </>
      ) : null}
    </section>
  );
}
