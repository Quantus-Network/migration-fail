import { Fragment, useId, useState } from "react";
import type { CoinWithPercentage } from "@/types/coingecko";
import { formatMarketCapFull } from "@/lib/format-tracker";
import {
  getTopCoinExplainer,
  getTopCoinSignature,
} from "@/constants/top-coins-signatures";
import {
  AnnotationCard,
  CARD_TEXT_WRAP,
  ExpandingRow,
  useHoverNone,
  usePointerFine,
} from "./HoverAnnotation";

interface Props {
  coins: CoinWithPercentage[];
  loading: boolean;
}

function formatMarketCap(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercentage(value: number): string {
  if (value < 0.01) {
    return value.toFixed(4);
  }
  if (value < 1) {
    return value.toFixed(2);
  }
  return value.toFixed(1);
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-content-10 animate-pulse shrink-0" />
          <div className="h-4 w-16 bg-content-10 animate-pulse" />
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="h-4 w-14 bg-content-10 animate-pulse" />
      </td>
      <td className="py-2.5 px-3">
        <div className="h-4 w-12 bg-content-10 animate-pulse" />
      </td>
    </tr>
  );
}

export function TopCoinsTable({ coins, loading }: Props) {
  const fine = usePointerFine();
  // Touch fallback for the hover cards: rows expand on tap instead. Requires
  // no hover *and* no mouse, so hybrids keep the desktop behaviour.
  const expandable = useHoverNone() && !fine;
  const uid = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    coin: CoinWithPercentage;
  } | null>(null);

  return (
    <section className="py-8">
      <h3 className="text-sm uppercase text-content mb-6">
        EXHIBIT B &middot; TOP 20 &middot; ALL VULNERABLE
      </h3>

      <div className="border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-med bg-surface">
            <tr>
              <th className="py-2.5 px-3 font-normal text-content text-sm">
                Coin
              </th>
              <th className="py-2.5 px-3 font-normal text-content text-sm text-right">
                Market Cap
              </th>
              <th className="py-2.5 px-3 font-normal text-content text-sm text-right">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            ) : coins.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-content-60">
                  No data available
                </td>
              </tr>
            ) : (
              coins.map((coin, index) => {
                const open = expandable && openId === coin.id;
                const stripId = `${uid}-${coin.id}`;
                return (
                <Fragment key={coin.id}>
                <tr
                  className={
                    expandable
                      ? `cursor-pointer transition-colors ${
                          open ? "bg-content-4" : ""
                        }`
                      : "border-b border-border last:border-b-0 hover:bg-content-4 transition-colors"
                  }
                  aria-expanded={expandable ? open : undefined}
                  aria-controls={expandable ? stripId : undefined}
                  onClick={
                    expandable
                      ? () => setOpenId((prev) => (prev === coin.id ? null : coin.id))
                      : undefined
                  }
                  onMouseEnter={
                    fine
                      ? (e) => setHover({ x: e.clientX, y: e.clientY, coin })
                      : undefined
                  }
                  onMouseMove={
                    fine
                      ? (e) => setHover({ x: e.clientX, y: e.clientY, coin })
                      : undefined
                  }
                  onMouseLeave={fine ? () => setHover(null) : undefined}
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-content-40 tabular-nums w-4 text-xs">
                        {index + 1}
                      </span>
                      {coin.image ? (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-5 h-5 rounded-full shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-content-20 shrink-0" />
                      )}
                      <span className="text-content font-medium truncate">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-content text-right whitespace-nowrap">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-flare text-right whitespace-nowrap">
                    {formatPercentage(coin.percentageOfTotal)}%
                  </td>
                </tr>
                {expandable && (
                  <ExpandingRow
                    id={stripId}
                    open={open}
                    colSpan={3}
                    divider={index !== coins.length - 1}
                  >
                    <div className="text-content">
                      {coin.market_cap === null
                        ? "N/A"
                        : formatMarketCapFull(coin.market_cap)}
                    </div>
                    <div className="text-content-60">
                      {coin.percentageOfTotal.toFixed(4)}% of total
                    </div>
                    <div className="text-flare">
                      SIGNATURE: {getTopCoinSignature(coin.id)}
                    </div>
                    {getTopCoinExplainer(coin.id) && (
                      <div className="text-xs text-content-40 normal-case">
                        {getTopCoinExplainer(coin.id)}
                      </div>
                    )}
                  </ExpandingRow>
                )}
                </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-content-40 text-xs mt-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-flare" />
        Uses signatures a quantum computer could break
      </p>

      {fine && hover && (
        <AnnotationCard x={hover.x} y={hover.y}>
          <div className="text-content">
            {hover.coin.market_cap === null
              ? "N/A"
              : formatMarketCapFull(hover.coin.market_cap)}
          </div>
          <div className="text-content-60">
            {hover.coin.percentageOfTotal.toFixed(4)}% of total
          </div>
          <div className="text-flare">
            SIGNATURE: {getTopCoinSignature(hover.coin.id)}
          </div>
          {getTopCoinExplainer(hover.coin.id) && (
            <div className={`text-xs text-content-40 normal-case ${CARD_TEXT_WRAP}`}>
              {getTopCoinExplainer(hover.coin.id)}
            </div>
          )}
        </AnnotationCard>
      )}
    </section>
  );
}
