import { expect, test } from "bun:test";
import { PQ_COINS } from "@/constants/pq-coins";
import {
  DIMENSION_ORDER,
  aspectTone,
  readinessByTicker,
  readinessSummary,
} from "@/data/readiness-data";

test("every Exhibit A coin has a readiness row", () => {
  for (const coin of PQ_COINS) {
    expect(readinessByTicker(coin.symbol)).toBeDefined();
  }
});

test("unknown ticker is unassessed, not silently treated as ready", () => {
  expect(readinessByTicker("NOPE")).toBeUndefined();
});

test("Quantus passes every aspect", () => {
  const chain = readinessByTicker("QUAN");
  expect(chain).toBeDefined();
  const summary = readinessSummary(chain!);
  expect(summary.passed).toBe(DIMENSION_ORDER.length);
  expect(summary.total).toBe(5);
  expect(summary.tones).toEqual(["pass", "pass", "pass", "pass", "pass"]);
});

test("NEAR listing is not full coverage: only signatures pass", () => {
  const summary = readinessSummary(readinessByTicker("NEAR")!);
  expect(summary.passed).toBe(1);
  expect(summary.passedKeys).toEqual(["sigs"]);
  expect(summary.tones[0]).toBe("pass");
  expect(summary.tones.slice(1)).not.toContain("pass");
});

test("IOTA is listed but has no post-quantum aspects", () => {
  const summary = readinessSummary(readinessByTicker("IOTA")!);
  expect(summary.passed).toBe(0);
  expect(summary.passedKeys).toEqual([]);
});

test("XX Network is not fully covered: zk fails", () => {
  const summary = readinessSummary(readinessByTicker("XX")!);
  expect(summary.passed).toBe(4);
  expect(summary.passedKeys).not.toContain("zk");
  expect(summary.tones[3]).toBe("fail");
});

test("aspectTone keeps unverified fails neutral", () => {
  expect(aspectTone({ state: "pass", evidence: "ok" })).toBe("pass");
  expect(aspectTone({ state: "fail", evidence: "broken" })).toBe("fail");
  expect(
    aspectTone({ state: "fail", evidence: "unknown", uncertain: true }),
  ).toBe("uncertain");
});
