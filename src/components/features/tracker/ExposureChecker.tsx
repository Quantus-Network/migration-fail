import { useId, useState, type FormEvent } from "react";
import {
  checkAddress,
  deriveRisk,
  formatEth,
  isValidAddressInput,
  truncateAddress,
  type ExposureResult,
  type Risk,
} from "@/lib/exposure-check";

type Phase = "idle" | "loading" | "done" | "error";

/**
 * Five verdicts over our three palette tokens: sage reads safe, Gamboge warns,
 * flare marks exposed value. The quantus.com labels are reused for family
 * consistency, but their colours are off-palette stock Tailwind and are
 * deliberately not imported.
 */
const RISK_TONE: Record<Risk, string> = {
  "VERY LOW": "text-sage",
  LOW: "text-sage",
  MEDIUM: "text-gamboge",
  HIGH: "text-flare",
  "VERY HIGH": "text-flare",
};

/** The stamp's label column, so every value starts on the same axis. */
function StampLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2">
      <span className="uppercase tracking-widest text-content-40">{label}</span>
      <span>{children}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-8">
      {/* One bar per stamp line: address, public key, balance, risk. */}
      <div className="border-y border-border py-4 space-y-2.5 animate-pulse">
        <div className="h-3 w-64 max-w-full bg-content-10" />
        <div className="h-3 w-52 max-w-full bg-content-10" />
        <div className="h-3 w-56 max-w-full bg-content-10" />
        <div className="h-3 w-40 max-w-full bg-content-10" />
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-content-40">
        Scanning chain data&hellip;
      </p>
    </div>
  );
}

export function ExposureChecker() {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState<ExposureResult | null>(null);
  // The input the result belongs to, frozen at submit so the stamp keeps
  // showing what was actually scanned while the field is edited.
  const [scanned, setScanned] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const entry = value.trim();

    if (!isValidAddressInput(entry)) {
      setInvalid(true);
      setPhase("idle");
      setResult(null);
      return;
    }

    setInvalid(false);
    setScanned(entry);
    setPhase("loading");
    setResult(null);

    try {
      setResult(await checkAddress(entry));
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  const risk = result ? deriveRisk(result) : null;

  return (
    <section className="py-8">
      <h3 className="text-sm uppercase tracking-widest text-content mb-6">
        EXHIBIT C &middot; CHECK YOUR OWN EXPOSURE
      </h3>

      <p className="text-content-40 text-sm mb-6">
        Enter any Ethereum address. Reads public blockchain data only.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          id={inputId}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (invalid) setInvalid(false);
          }}
          aria-label="Ethereum address or ENS name"
          aria-invalid={invalid || undefined}
          spellCheck={false}
          autoComplete="off"
          placeholder="0x… address or ENS name"
          className="flex-1 min-w-0 bg-void border border-border px-4 py-3 text-content placeholder:text-content-40 tabular-nums outline-none focus:border-border-med transition-colors"
        />
        <button
          type="submit"
          className="border border-border px-4 py-3 text-xs uppercase tracking-widest text-content-60 hover:border-flare hover:text-flare transition-colors"
        >
          Run check
        </button>
      </form>

      {invalid && (
        <p className="mt-2 text-xs uppercase tracking-widest text-flare">
          Invalid address format
        </p>
      )}

      {/* One live region for every outcome, so a screen reader is told the
          result without the stamp needing focus. */}
      <div aria-live="polite">
        {phase === "loading" && <Skeleton />}

        {phase === "error" && (
          <p className="mt-8 text-xs uppercase tracking-widest text-flare">
            Scan failed &middot; try again
          </p>
        )}

        {phase === "done" && result && risk && (
          <>
            <div className="mt-8 border-y border-border py-4 space-y-1.5 text-xs tabular-nums">
              <StampLine label="Address">
                <span className="text-content">
                  {truncateAddress(scanned)}
                </span>
              </StampLine>

              <StampLine label="Public key">
                <span className={result.exposed ? "text-flare" : "text-sage"}>
                  {result.exposed ? "EXPOSED" : "NOT YET EXPOSED"}
                </span>
              </StampLine>

              <StampLine label="Balance">
                <span className="text-content">
                  {formatEth(result.balanceEth)}
                </span>
              </StampLine>

              <StampLine label="Risk">
                <span className={RISK_TONE[risk]}>{risk}</span>
              </StampLine>
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
