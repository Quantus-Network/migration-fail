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
      <h3 className="text-sm uppercase text-content mb-6">
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
          className="border border-border px-4 py-3 text-xs uppercase text-content-60 hover:border-flare hover:text-flare transition-colors"
        >
          Run check
        </button>
      </form>

      {invalid && (
        <p className="mt-2 text-xs uppercase text-flare">
          Invalid address format
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

        {phase === "done" && result && risk && (
          <>
            <div className="mt-8 border-y border-border py-5">
              {/* What was scanned, kept quiet: it identifies the reading
                  without competing with the verdict. */}
              {/* Only the label uppercases. The address must keep its own
                  casing: EIP-55 encodes the checksum in it, and "0X" reads as
                  a rendering fault. */}
              <p className="text-xs text-content-40 tabular-nums">
                <span className="uppercase">Address</span>{" "}
                {truncateAddress(scanned)}
              </p>

              <p className="mt-5 text-xs uppercase text-content-40">Risk:</p>
              <p
                className={`text-4xl md:text-5xl leading-none ${RISK_TONE[risk]}`}
              >
                {risk}
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
