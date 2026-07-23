import {
  formatMarketCap,
  formatMarketCapFull,
  formatPercentage,
} from "@/lib/format-tracker";
import { OG_HEIGHT, OG_WIDTH } from "@/lib/og-dimensions";

interface OgTrackerStats {
  pqPercentage: number;
  pqMarketCap: number;
  totalMarketCap: number;
  updatedAt?: Date | string;
}

const colors = {
  void: "#0e0e0e",
  flare: "#ff6b35",
  content: "#e8e6e0",
  sage: "#6dbf8a",
  content60: "rgba(232, 230, 224, 0.6)",
  content40: "rgba(232, 230, 224, 0.4)",
  content10: "rgba(232, 230, 224, 0.1)",
  border: "rgba(232, 230, 224, 0.08)",
} as const;

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

function formatObserved(value: Date | string | undefined): string {
  const d = value instanceof Date ? value : value ? new Date(value) : new Date();
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hh}:${mm} UTC`;
}

export function buildOgElement(stats: OgTrackerStats) {
  const remainingPct = 100 - stats.pqPercentage;
  const [intPart, decPart] = remainingPct.toFixed(2).split(".");
  const remainingMarketCap = stats.totalMarketCap - stats.pqMarketCap;
  const pqMarketCap = formatMarketCap(stats.pqMarketCap);
  const totalMarketCap = formatMarketCap(stats.totalMarketCap);
  const fillPct = Math.max(stats.pqPercentage, 0.25);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        padding: "64px 72px",
        background: colors.void,
        fontFamily: "Geist",
        color: colors.content,
      }}
    >
      <p
        style={{
          margin: "0 0 36px",
          fontFamily: "Geist Mono",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: colors.content40,
        }}
      >
        Share of Crypto Market Cap Not Yet Quantum Secure
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          margin: "0 0 28px",
          color: colors.flare,
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: 168, letterSpacing: "-0.04em" }}>
          {intPart}
        </span>
        <span style={{ fontSize: 168, letterSpacing: "-0.04em" }}>.</span>
        <span style={{ fontSize: 168, letterSpacing: "-0.04em" }}>
          {decPart}
        </span>
        <span
          style={{
            marginLeft: 16,
            fontSize: 92,
            fontWeight: 500,
          }}
        >
          %
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          margin: "0 0 8px",
          lineHeight: 1.15,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: colors.content,
          }}
        >
          {formatMarketCapFull(remainingMarketCap)}
        </span>
        <span
          style={{
            marginLeft: 12,
            fontSize: 28,
            color: colors.content60,
          }}
        >
          still vulnerable
        </span>
      </div>

      <p
        style={{
          display: "flex",
          margin: "0 0 36px",
          fontFamily: "Geist Mono",
          fontSize: 22,
          fontWeight: 500,
        }}
      >
        <span style={{ color: colors.sage }}>
          {formatPercentage(stats.pqPercentage)}% ({pqMarketCap})
        </span>
        <span style={{ marginLeft: 8, color: colors.content40 }}>
          migrated
        </span>
      </p>

      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            fontFamily: "Geist Mono",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <span style={{ color: colors.sage }}>SECURED {pqMarketCap}</span>
          <span style={{ color: colors.content40 }}>
            TOTAL {totalMarketCap}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            height: 10,
            background: colors.content10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fillPct}%`,
              height: "100%",
              background: colors.sage,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontFamily: "Geist Mono",
            fontSize: 16,
            fontWeight: 500,
            color: colors.content40,
          }}
        >
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 36,
          paddingTop: 18,
          borderTop: `1px solid ${colors.border}`,
          fontFamily: "Geist Mono",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: colors.content40,
        }}
      >
        {`LAST OBSERVED: ${formatObserved(stats.updatedAt)} · SOURCE: COINGECKO · STATUS: NOT MIGRATED`}
      </div>
    </div>
  );
}
