import {
  DIMENSION_ORDER,
  DIMENSION_SHORT,
  gradeTone,
  readinessByTicker,
  readinessSummary,
  type AspectTone,
} from "@/data/readiness-data";
import { CARD_TEXT_WRAP } from "./HoverAnnotation";

const TONE_CLASS: Record<AspectTone, string> = {
  pass: "bg-sage",
  fail: "bg-flare",
  uncertain: "bg-content-40",
};

const UNASSESSED: AspectTone[] = DIMENSION_ORDER.map(() => "uncertain");

function overlayCopy(ticker: string): { tones: AspectTone[]; text: string } {
  const chain = readinessByTicker(ticker);
  if (!chain) {
    return {
      tones: UNASSESSED,
      text: "Post-quantum readiness not assessed",
    };
  }
  const summary = readinessSummary(chain);
  const protectedList = summary.passedKeys
    .map((key) => DIMENSION_SHORT[key])
    .join(", ");
  const coverage =
    summary.passed === 0
      ? "None protected."
      : summary.passed === summary.total
        ? "All five aspects are post-quantum."
        : `Protected: ${protectedList}.`;
  return {
    tones: summary.tones,
    text: `Grade ${chain.grade}. Post-quantum aspects: ${summary.passed} of ${summary.total}. ${coverage}`,
  };
}

/** Five-aspect marks beside an Exhibit A coin icon. */
export function ReadinessOverlay({ ticker }: { ticker: string }) {
  const { tones, text } = overlayCopy(ticker);
  return (
    <span className="relative inline-flex shrink-0 gap-px">
      {tones.map((tone, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-1.5 w-1.5 ${TONE_CLASS[tone]}`}
        />
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** Exhibit C grade chip — the readable at-rest mark next to the ticker. */
export function ReadinessGrade({ ticker }: { ticker: string }) {
  const chain = readinessByTicker(ticker);
  if (!chain) return null;
  const tone = gradeTone(chain.grade);
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 px-1 py-0.5 text-[10px] font-bold leading-none tabular-nums ${tone.bg} ${tone.text}`}
    >
      {chain.grade}
    </span>
  );
}

/** Grade plus coverage, used in the hover card and the touch strip. */
export function ReadinessDetail({ ticker }: { ticker: string }) {
  const chain = readinessByTicker(ticker);
  if (!chain) {
    return <div className="text-content-40">READINESS not assessed</div>;
  }
  const summary = readinessSummary(chain);
  const tone = gradeTone(chain.grade);
  const protectedList = summary.passedKeys
    .map((key) => DIMENSION_SHORT[key])
    .join(", ");
  return (
    <>
      <div>
        <span className={tone.text}>
          READINESS {chain.grade} · {summary.passed}/{summary.total}
        </span>
      </div>
      <div className={`text-xs text-content-40 normal-case ${CARD_TEXT_WRAP}`}>
        {summary.passed === 0
          ? "No post-quantum aspects."
          : summary.passed === summary.total
            ? "All five aspects are post-quantum."
            : `Protected: ${protectedList}.`}
      </div>
    </>
  );
}
