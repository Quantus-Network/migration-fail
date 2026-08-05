import { useEffect, useState } from "react";
import { PQ_COINS } from "@/constants/pq-coins";
import { fetchTrackerData, type TrackerData } from "@/types/coingecko";
import { PercentageHero } from "./PercentageHero";
import { CoinTable } from "./CoinTable";
import { TopCoinsTable } from "./TopCoinsTable";
import { ExposureChecker } from "./ExposureChecker";
import { ExplainerSection } from "./ExplainerSection";

const REFRESH_MS = 5 * 60_000; // 5 minutes, to stay under CoinGecko rate limits

// In-memory cache of the last successful payload. Module scope only (NOT
// localStorage), so remounts within the same session reuse it instead of
// refetching. Cleared on a full page reload.
let cachedPayload: { data: TrackerData; observedAt: Date } | null = null;

export function PQTracker() {
  const [data, setData] = useState<TrackerData | null>(
    cachedPayload?.data ?? null
  );
  const [observedAt, setObservedAt] = useState<Date | null>(
    cachedPayload?.observedAt ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(cachedPayload === null);

  useEffect(() => {
    let cancelled = false;

    async function load(initial: boolean) {
      try {
        const next = await fetchTrackerData();
        if (cancelled) return;
        const now = new Date();
        cachedPayload = { data: next, observedAt: now };
        setData(next);
        setObservedAt(now);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        // Only surface an error while there is nothing to show. Once good data
        // is on screen, background-refresh failures are ignored (last good
        // values stay). An initial failure keeps the interval running below,
        // so the page recovers automatically on a later success.
        if (initial) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
          setLoading(false);
        }
      }
    }

    // Skip the initial fetch when a cached payload is already on screen.
    if (!cachedPayload) {
      load(true);
    }

    const id = setInterval(() => load(false), REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PercentageHero
        data={data}
        loading={loading}
        error={error}
        observedAt={observedAt}
      />

      <CoinTable
        coins={data?.coins || []}
        pqCoinsConfig={PQ_COINS}
        loading={loading}
      />

      <TopCoinsTable coins={data?.topCoins || []} loading={loading} />

      <ExposureChecker />

      <ExplainerSection />
    </div>
  );
}
