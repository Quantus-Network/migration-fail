import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePointerFine } from "./HoverAnnotation";
import {
  checkAddress,
  formatEth,
  isValidCheckerInput,
  type ExposureResult,
  type Risk,
} from "@/lib/exposure-check";

type Phase = "idle" | "loading" | "done" | "error";

/**
 * Five verdicts over our three palette tokens: sage reads safe, Gamboge warns,
 * flare marks exposed value. Labels match the website quantum-risk-checker
 * risk bands; colours stay on the tracker palette.
 */
const RISK_TONE: Record<Risk, string> = {
  "VERY LOW": "text-sage",
  LOW: "text-sage",
  MEDIUM: "text-gamboge",
  HIGH: "text-flare",
  "VERY HIGH": "text-flare",
};

function Skeleton() {
  return (
    <div className="mt-8">
      {/* Mirrors the stamp's shape: address, RISK label, the verdict at
          display size, then the summary sentence. */}
      <div className="border-y border-border py-5 animate-pulse">
        <div className="h-3 w-40 max-w-full bg-content-10" />
        <div className="h-3 w-12 max-w-full bg-content-10 mt-5" />
        <div className="h-10 md:h-12 w-56 max-w-full bg-content-10 mt-2" />
        <div className="h-4 w-72 max-w-full bg-content-10 mt-4" />
      </div>
      <p className="mt-3 text-xs uppercase text-content-40">
        Scanning chain data&hellip;
      </p>
    </div>
  );
}

export function ExposureChecker() {
  const inputId = useId();
  const fine = usePointerFine();
  const sectionRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** The instrument is dimmed until the section is actually being read. */
  const [awake, setAwake] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState<ExposureResult | null>(null);

  /**
   * Wake once per page load when the section is meaningfully on screen.
   *
   * Real focus is taken only on fine pointers, and only via
   * `preventScroll: true` so it cannot yank the page mid-scroll. On touch we
   * deliberately do not focus: that would raise the on-screen keyboard without
   * being asked, so those devices get the simulated caret instead.
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || awake) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setAwake(true);
        observer.disconnect();
        if (fine) inputRef.current?.focus({ preventScroll: true });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fine, awake]);

  // Only while the field is genuinely empty and unfocused; a real caret takes
  // over the moment focus lands, including the programmatic focus above.
  const showCaret = awake && !hasFocus && value === "";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const entry = value.trim();

    if (!isValidCheckerInput(entry)) {
      setInvalid(true);
      setPhase("idle");
      setResult(null);
      return;
    }

    setInvalid(false);
    setPhase("loading");
    setResult(null);

    try {
      setResult(await checkAddress(entry));
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  return (
    <section ref={sectionRef} id="check" className="py-8 scroll-mt-8">
      <h3 className="text-sm uppercase text-content mb-6">
        EXHIBIT D &middot; CHECK YOUR OWN EXPOSURE
      </h3>

      <p className="text-content-40 text-sm mb-6">
        Enter any Ethereum address or ENS name. Reads public blockchain data only.
      </p>

      {/* Stacks below 480px (input full width, button full width beneath) and
          sits on one row above it. min-w-0 on the row is what lets the input
          shrink instead of forcing the section wider than the viewport. */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col min-[480px]:flex-row gap-2 min-w-0"
      >
        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            id={inputId}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (invalid) setInvalid(false);
            }}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            aria-label="Ethereum address or ENS name"
            aria-invalid={invalid || undefined}
            spellCheck={false}
            autoComplete="off"
            placeholder="0x… or name.eth"
            // size=1 kills the input's ~20ch intrinsic width, which is what was
            // pushing the section past 320px; w-full gives the width back.
            size={1}
            className={`w-full min-w-0 bg-void border px-4 py-4 text-lg text-content placeholder:text-content-40 tabular-nums outline-none transition-colors duration-300 motion-reduce:transition-none ${
              awake ? "border-content" : "border-border"
            }`}
          />
          {showCaret && (
            <span
              aria-hidden="true"
              className="caret-blink pointer-events-none absolute left-4 top-1/2 h-6 w-px -translate-y-1/2 bg-content"
            />
          )}
        </div>
        <button
          type="submit"
          // Idle dimmed, sharpening to full content on arrival. Flare stays
          // reserved for hover and press, so waking never looks like a hover.
          className={`w-full min-[480px]:w-auto shrink-0 border px-4 py-3 text-xs uppercase transition-colors duration-300 motion-reduce:transition-none hover:border-flare hover:text-flare ${
            awake
              ? "border-content text-content"
              : "border-border text-content-60"
          }`}
        >
          Run check
        </button>
      </form>

      {invalid && (
        <p className="mt-2 text-xs uppercase text-flare">
          Enter an address or ENS name
        </p>
      )}

      {/* One live region for every outcome, so a screen reader is told the
          result without the stamp needing focus. */}
      <div aria-live="polite">
        {phase === "loading" && <Skeleton />}

        {phase === "error" && (
          <p className="mt-8 text-xs uppercase text-flare">
            Scan failed &middot; try again
          </p>
        )}

        {phase === "done" && result && (
          <>
            <div className="mt-8 border-y border-border py-5">
              {/* What was scanned, kept quiet: it identifies the reading
                  without competing with the verdict. */}
              {/* Only the label uppercases. The address must keep its own
                  casing: EIP-55 encodes the checksum in it, and "0X" reads as
                  a rendering fault. */}
              <p className="text-xs text-content-40 tabular-nums">
                <span className="uppercase">Address</span>{" "}
                {result.displayLabel}
              </p>

              <p className="mt-5 text-xs uppercase text-content-40">Risk:</p>
              <p
                className={`text-4xl md:text-5xl leading-none ${RISK_TONE[result.risk]}`}
              >
                {result.risk}
              </p>

              <p className="mt-4 text-base text-content-60">
                <span className={result.exposed ? "text-flare" : "text-sage"}>
                  Public key {result.exposed ? "exposed" : "not yet exposed"}
                </span>
                {" · "}
                <span className="tabular-nums text-content">
                  {formatEth(result.balanceEth)}
                </span>{" "}
                {result.exposed ? "at risk" : "held"}
              </p>
            </div>

            <p className="mt-3 text-xs text-content-40">
              Mitigation: move assets to a post-quantum chain{" "}
              <span aria-hidden="true">&rarr;</span>{" "}
              <a
                href="https://www.quantus.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-flare hover:underline decoration-1 underline-offset-2 transition-colors"
              >
                Quantus wallet
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
