import { useState } from "react";
import type { CoinWithPercentage } from "@/types/coingecko";
import type { PQCoin } from "@/constants/pq-coins";
import { formatMarketCapFull } from "@/lib/format-tracker";
import { AnnotationCard, usePointerFine } from "./HoverAnnotation";

interface Props {
  coins: CoinWithPercentage[];
  pqCoinsConfig: PQCoin[];
  loading: boolean;
}

function formatMarketCap(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercentage(value: number): string {
  if (value === 0) {
    return "0";
  }
  if (value < 0.0001) {
    return "<0.0001";
  }
  if (value < 0.01) {
    return value.toFixed(5);
  }
  if (value < 1) {
    return value.toFixed(4);
  }
  return value.toFixed(2);
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-content-10 animate-pulse shrink-0" />
          <div className="h-4 w-20 bg-content-10 animate-pulse" />
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="h-4 w-14 bg-content-10 animate-pulse" />
      </td>
      <td className="py-2.5 px-3">
        <div className="h-4 w-16 bg-content-10 animate-pulse" />
      </td>
    </tr>
  );
}

export function CoinTable({ coins, pqCoinsConfig, loading }: Props) {
  const configMap = new Map(pqCoinsConfig.map((c) => [c.id, c]));
  const fine = usePointerFine();
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    coin: CoinWithPercentage;
  } | null>(null);

  return (
    <section className="py-8">
      <h3 className="font-mono text-sm uppercase tracking-widest text-content mb-6">
        EXHIBIT A &middot; QUANTUM-SECURE COINS
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
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : coins.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-content-60">
                  No data available
                </td>
              </tr>
            ) : (
              coins.map((coin) => {
                const config = configMap.get(coin.id);
                return (
                  <tr
                    key={coin.id}
                    className="border-b border-border last:border-b-0 hover:bg-content-4 transition-colors"
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
                        {coin.image ? (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-5 h-5 rounded-full shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-content-20 shrink-0" />
                        )}
                        <a
                          href={config?.website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-content hover:text-flare transition-colors font-medium truncate"
                        >
                          {coin.symbol.toUpperCase()}
                        </a>
                        <span className="text-content-40 text-xs truncate hidden sm:inline">
                          {coin.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono text-right whitespace-nowrap ${
                        coin.market_cap === null
                          ? "text-xs text-content-40"
                          : "text-content"
                      }`}
                    >
                      {coin.market_cap === null
                        ? "TESTNET"
                        : formatMarketCap(coin.market_cap)}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono text-right whitespace-nowrap ${
                        coin.market_cap === null ? "text-content-40" : "text-sage"
                      }`}
                    >
                      {coin.market_cap === null
                        ? "·"
                        : `${formatPercentage(coin.percentageOfTotal)}%`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-content-40 text-xs mt-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-sage" />
        Uses quantum-resistant cryptographic algorithms
      </p>

      {fine && hover && (
        <AnnotationCard x={hover.x} y={hover.y}>
          <div className="text-content">
            {hover.coin.market_cap === null
              ? "TESTNET"
              : formatMarketCapFull(hover.coin.market_cap)}
          </div>
          <div className="text-content-60">
            {hover.coin.market_cap === null
              ? "·"
              : `${hover.coin.percentageOfTotal.toFixed(4)}% of total`}
          </div>
          <div className="text-sage">
            SIGNATURE:{" "}
            {configMap.get(hover.coin.id)?.signature ?? "PQC (unverified)"}
          </div>
        </AnnotationCard>
      )}
    </section>
  );
}
