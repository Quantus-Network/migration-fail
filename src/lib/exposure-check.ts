/**
 * Exposure checker data layer.
 *
 * STAGE 1: every result below is fabricated. `checkAddress` is the single seam
 * the UI talks to, so Stage 2 replaces its body with real JSON-RPC calls
 * (eth_getTransactionCount for exposure, eth_getBalance for balance) without
 * the component changing at all.
 */

export interface ExposureResult {
  /** True once the account has sent a transaction: signing publishes the
   *  public key on chain, which is what a quantum attacker would need. */
  exposed: boolean;
  /** Year of the first outgoing transaction, or null when never sent. */
  firstTxYear: number | null;
  balanceEth: number;
}

export type Risk = "LOW" | "MEDIUM" | "HIGH";

/**
 * Two-factor risk, mirroring the quantus.com checker: exposure decides whether
 * there is anything to attack, balance decides whether it is worth attacking.
 * An unexposed account is LOW at any balance, because the public key is still
 * hidden behind its hash.
 *
 * NOTE: the balance cut-offs are our own and have not been checked against
 * quantus.com's published thresholds. Confirm before this ships.
 */
export const HIGH_BALANCE_ETH = 1;
export const MEDIUM_BALANCE_ETH = 0.01;

export function deriveRisk({ exposed, balanceEth }: ExposureResult): Risk {
  if (!exposed) return "LOW";
  if (balanceEth >= HIGH_BALANCE_ETH) return "HIGH";
  if (balanceEth >= MEDIUM_BALANCE_ETH) return "MEDIUM";
  return "LOW";
}

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const ENS_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i;

export function isValidAddressInput(value: string): boolean {
  const v = value.trim();
  return ADDRESS_RE.test(v) || ENS_RE.test(v);
}

/** 0x1a2b…9f3c — enough of both ends to compare against a wallet by eye. */
export function truncateAddress(value: string): string {
  const v = value.trim();
  if (!ADDRESS_RE.test(v)) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export function formatEth(value: number): string {
  return `${value.toFixed(4)} ETH`;
}

/**
 * STAGE 1 FIXTURES — review handles.
 *
 *   0x1111…1111  exposed, large balance   -> HIGH
 *   0x2222…2222  exposed, small balance   -> MEDIUM
 *   0x3333…3333  never sent               -> LOW, NOT EXPOSED, year n/a
 *   0x4444…4444  exposed, dust, no year   -> LOW with FIRST EXPOSURE n/a
 *   0x0000…0000  throws                   -> error state
 *   vitalik.eth  exposed, large balance   -> HIGH (ENS input path)
 *   error.eth    throws                   -> error state via ENS path
 *
 * Anything else valid falls through to a deterministic pseudo-result so the
 * section can be exercised with arbitrary addresses.
 */
const FIXTURES: Record<string, ExposureResult | "error"> = {
  "0x1111111111111111111111111111111111111111": {
    exposed: true,
    firstTxYear: 2017,
    balanceEth: 42.318,
  },
  "0x2222222222222222222222222222222222222222": {
    exposed: true,
    firstTxYear: 2021,
    balanceEth: 0.1843,
  },
  "0x3333333333333333333333333333333333333333": {
    exposed: false,
    firstTxYear: null,
    balanceEth: 3.5,
  },
  "0x4444444444444444444444444444444444444444": {
    exposed: true,
    firstTxYear: null,
    balanceEth: 0.0004,
  },
  "0x0000000000000000000000000000000000000000": "error",
  "vitalik.eth": { exposed: true, firstTxYear: 2015, balanceEth: 1203.9982 },
  "error.eth": "error",
};

/** Deterministic so the same address always reviews the same way. */
function pseudoResult(key: string): ExposureResult {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  const exposed = h % 4 !== 0;
  return {
    exposed,
    firstTxYear: exposed ? 2015 + (h % 11) : null,
    balanceEth: ((h % 900000) / 10000) * (h % 3 === 0 ? 0.001 : 1),
  };
}

/** Mock latency, so the loading state is reviewable. */
const MOCK_DELAY_MS = 900;

export async function checkAddress(address: string): Promise<ExposureResult> {
  const key = address.trim().toLowerCase();

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const fixture = FIXTURES[key];
  if (fixture === "error") {
    throw new Error("scan failed");
  }
  return fixture ?? pseudoResult(key);
}
