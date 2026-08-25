import { Fragment, useId, useState } from "react";
import {
  DIMENSION_LABELS,
  DIMENSION_ORDER,
  READINESS_CHAINS,
  READINESS_SOURCE_URL,
  SCHEME_SPECS,
  gradeTone,
  type DimensionKey,
  type ReadinessChain,
} from "@/data/readiness-data";
import { ExpandingRow, useHoverNone, usePointerFine } from "./HoverAnnotation";
import { GlossaryTerm } from "./GlossaryTerm";
import { getDefinition } from "@/constants/glossary";

function DimensionRow({
  chain,
  dimension,
}: {
  chain: ReadinessChain;
  dimension: DimensionKey;
}) {
  const d = chain.dimensions[dimension];
  const pass = d.state === "pass";
  return (
    <div className="flex gap-2">
      {/* Sharp marks, not rounded glyphs, to match the instrument register. */}
      <span
        aria-hidden="true"
        className={`shrink-0 w-4 ${pass ? "text-sage" : "text-flare"}`}
      >
        {pass ? "✓" : "✕"}
      </span>
      <span className="min-w-0 break-words">
        <span className="text-content">{DIMENSION_LABELS[dimension]}</span>{" "}
        <span className="text-content-60">{d.evidence}</span>
        {d.uncertain && (
          <span className="text-content-40"> (unverified)</span>
        )}
        <span className="sr-only">{pass ? " — pass" : " — fail"}</span>
      </span>
    </div>
  );
}

export function ReadinessTable() {
  const uid = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  // Same hybrid guard used elsewhere: a device reporting both a mouse and a
  // touchscreen keeps the desktop behaviour, so it never gets the definition
  // line *and* the tooltips.
  const fine = usePointerFine();
  const touch = useHoverNone() && !fine;

  return (
    <section className="py-8">
      <h3 className="text-sm uppercase text-content mb-6">
        EXHIBIT C &middot; QUANTUM READINESS ASSESSMENT
      </h3>

      <div className="space-y-3 text-content-40 text-sm max-w-3xl mb-6">
        <p>
          An independent technical assessment grading networks solely on current
          adoption of standardized post-quantum cryptography. Grades reflect
          implementation status as of February 2026, not overall project
          quality, security in non-quantum contexts, or future potential. A
          lower grade indicates reliance on classical signatures, which is the
          common industry position today. Not investment advice. Verify claims
          directly.
        </p>
        <p>
          <a
            href={READINESS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flare hover:underline decoration-1 underline-offset-2 transition-colors uppercase text-xs"
          >
            Source: Quantum Canary technical assessment &middot; February 2026
          </a>
        </p>
      </div>

      <div className="border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-med bg-surface">
            <tr>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm">
                Chain
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm">
                Grade
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm">
                Status
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm">
                Scheme
              </th>
            </tr>
          </thead>
          <tbody>
            {READINESS_CHAINS.map((chain, index) => {
              const open = openId === chain.ticker;
              const stripId = `${uid}-${chain.ticker}`;
              const tone = gradeTone(chain.grade);
              return (
                <Fragment key={chain.ticker}>
                  <tr
                    className={`cursor-pointer transition-colors ${
                      open ? "bg-content-4" : "hover:bg-content-4"
                    }`}
                    aria-expanded={open}
                    aria-controls={stripId}
                    onClick={() =>
                      setOpenId((prev) =>
                        prev === chain.ticker ? null : chain.ticker,
                      )
                    }
                  >
                    <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3">
                      <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
                        {/* The affordance: a quiet +/- that turns flare on
                            hover, rather than a chevron. */}
                        <span
                          aria-hidden="true"
                          className="shrink-0 w-2 text-content-40"
                        >
                          {open ? "−" : "+"}
                        </span>
                        <span className="text-content truncate max-w-[7ch] min-[360px]:max-w-[10ch] min-[480px]:max-w-[16ch] sm:max-w-none">
                          {chain.name}
                        </span>
                        {/* The ticker is the first thing to go, and it stays
                            gone until 480. Measured: with it visible at 400px
                            the Chain column demands 162px against a 131px
                            budget, so the table cannot fit its container. The
                            name already identifies the row and the expansion
                            carries everything in full. */}
                        <span className="hidden min-[480px]:inline text-content-40 text-xs truncate">
                          {chain.ticker}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3">
                      <span
                        className={`inline-block px-1 min-[480px]:px-1.5 py-0.5 text-xs font-bold tabular-nums ${tone.bg} ${tone.text}`}
                      >
                        {chain.grade}
                      </span>
                    </td>
                    {/* Abbreviated rather than reduced to a dot: a dot would
                        need a tooltip to be legible, and tooltips are gated to
                        hover-capable devices — so on the phones this targets
                        the column would carry no information at all. */}
                    <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 text-xs text-content-40 uppercase whitespace-nowrap">
                      <span className="min-[480px]:hidden">
                        {chain.status === "Testnet" ? "Test" : "Main"}
                      </span>
                      <span className="hidden min-[480px]:inline">
                        {chain.status}
                      </span>
                    </td>
                    <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 text-xs whitespace-nowrap">
                      {/* The scheme name is the last thing to compress and the
                          only one that can be clipped without losing meaning:
                          the expansion below carries it in full. */}
                      <span className="inline-block align-bottom overflow-hidden text-ellipsis whitespace-nowrap max-w-[5ch] min-[360px]:max-w-[9ch] min-[480px]:max-w-none">
                        <GlossaryTerm term={chain.scheme}>
                          {chain.scheme}
                        </GlossaryTerm>
                      </span>
                      <span className="text-content-40"> &middot; </span>
                      <GlossaryTerm term={`NIST level ${chain.nistLevel}`}>
                        L{chain.nistLevel}
                      </GlossaryTerm>
                    </td>
                  </tr>
                  <ExpandingRow
                    id={stripId}
                    open={open}
                    colSpan={4}
                    divider={index !== READINESS_CHAINS.length - 1}
                  >
                    {/* Touch only: the tooltips that carry these definitions
                        on desktop cannot fire here, so the strip states them
                        outright before the dimensions. */}
                    {touch && (
                      <p className="text-xs text-content-60 pb-1">
                        {chain.scheme}
                        {getDefinition(chain.scheme) && (
                          <> &middot; {getDefinition(chain.scheme)}</>
                        )}{" "}
                        &middot; NIST security level {chain.nistLevel}
                      </p>
                    )}
                    {DIMENSION_ORDER.map((dimension) => (
                      <DimensionRow
                        key={dimension}
                        chain={chain}
                        dimension={dimension}
                      />
                    ))}
                  </ExpandingRow>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <h4 className="text-sm uppercase text-content-60 mt-12 mb-4">
        Signature scheme specifications
      </h4>
      <p className="text-content-40 text-xs mb-4">
        Signature size affects transaction fees and throughput. Quantum
        resistance has a cost measured in bytes.
      </p>
      {/* Below sm the five columns become one card per scheme. Compression
          could not save this table: Public Key and Signature are both headers
          longer than their values, so the columns cannot go narrow enough. */}
      <div className="border border-border sm:hidden">
        {SCHEME_SPECS.map((spec) => (
          <div
            key={spec.scheme}
            className="border-b border-border last:border-b-0 px-2 py-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <GlossaryTerm term={spec.scheme}>{spec.scheme}</GlossaryTerm>
              <span
                className={`shrink-0 text-xs uppercase ${
                  spec.type === "PQ" ? "text-sage" : "text-flare"
                }`}
              >
                {spec.type === "PQ" ? "PQ" : "Classical"}
              </span>
            </div>
            <div className="mt-1 text-xs text-content-60 tabular-nums">
              L{spec.level} &middot; Public key{" "}
              {spec.publicKeyBytes.toLocaleString()} B &middot; Signature{" "}
              {spec.signatureBytes.toLocaleString()} B
            </div>
            {/* The definition in full, since the card is the mobile view and
                its tooltip cannot be reached by tapping. */}
            {getDefinition(spec.scheme) && (
              <div className="mt-1 text-xs text-content-40">
                {getDefinition(spec.scheme)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border border-border hidden sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-med bg-surface">
            <tr>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm">
                Scheme
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm">
                Type
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm text-right">
                Level
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm text-right">
                <GlossaryTerm term="Public Key">Public Key</GlossaryTerm>
              </th>
              <th className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 font-normal text-content text-sm text-right">
                <GlossaryTerm term="Signature">Signature</GlossaryTerm>
              </th>
            </tr>
          </thead>
          <tbody>
            {SCHEME_SPECS.map((spec, index) => (
              <tr
                key={spec.scheme}
                className={
                  index !== SCHEME_SPECS.length - 1
                    ? "border-b border-border"
                    : undefined
                }
              >
                <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 text-content whitespace-nowrap">
                  <GlossaryTerm term={spec.scheme}>{spec.scheme}</GlossaryTerm>
                </td>
                <td
                  className={`py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 text-xs uppercase whitespace-nowrap ${
                    spec.type === "PQ" ? "text-sage" : "text-flare"
                  }`}
                >
                  {spec.type}
                </td>
                <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 text-xs text-right whitespace-nowrap">
                  <GlossaryTerm term={`NIST level ${spec.level}`}>
                    L{spec.level}
                  </GlossaryTerm>
                </td>
                <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 tabular-nums text-content-60 text-right whitespace-nowrap">
                  {spec.publicKeyBytes.toLocaleString()} B
                </td>
                <td className="py-3 px-1.5 min-[360px]:px-2 sm:py-2.5 sm:px-3 tabular-nums text-content-60 text-right whitespace-nowrap">
                  {spec.signatureBytes.toLocaleString()} B
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
