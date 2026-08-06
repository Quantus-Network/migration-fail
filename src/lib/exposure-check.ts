/**
 * Exposure checker data layer.
 *
 * Reads live mainnet state over public JSON-RPC, from the browser, with no API
 * key. Two calls, batched into one HTTP request per submit:
 *
 *   eth_getTransactionCount -> nonce. A nonce above zero means the account has
 *     signed at least one transaction, which publishes its public key on
 *     chain. That is what a quantum attacker needs, so nonce > 0 == exposed.
 *   eth_getBalance          -> wei held now.
 *
 * Address-only: ENS is not resolved. Doing it properly needs namehash, i.e. a
 * keccak-256 implementation plus a registry/resolver round trip, which is well
 * past the "if simple" bar and would mean pulling in a crypto dependency.
 */

export interface ExposureResult {
  /** True once the account has sent a transaction: signing publishes the
   *  public key on chain, which is what a quantum attacker would need. */
  exposed: boolean;
  /**
   * Year of the first outgoing transaction. NOT surfaced in v1: the stamp
   * drops the line, because no keyless endpoint provides it (eth_* gives a
   * nonce, not a date). Optional so the Stage 2 RPC layer can omit it
   * entirely; re-add the stamp line if an Etherscan key ever lands.
   */
  firstTxYear?: number | null;
  balanceEth: number;
}

export type Risk = "VERY LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";

/**
 * Two-factor risk: exposure decides whether there is anything to attack,
 * balance decides whether it is worth attacking. An account that has never
 * sent is VERY LOW at any balance, because its public key is still hidden
 * behind a hash.
 *
 * The label vocabulary matches the quantus.com checker so the two read as one
 * family, but the scoring is ours and genuinely reads chain data. Their score
 * is derived from the address string, so there is nothing numeric to match.
 *
 * PROVISIONAL: these cut-offs are our own and await team confirmation.
 */
export const MEDIUM_BALANCE_ETH = 0.01;
export const HIGH_BALANCE_ETH = 1;
export const VERY_HIGH_BALANCE_ETH = 10;

export function deriveRisk({ exposed, balanceEth }: ExposureResult): Risk {
  if (!exposed) return "VERY LOW";
  if (balanceEth < MEDIUM_BALANCE_ETH) return "LOW";
  if (balanceEth < HIGH_BALANCE_ETH) return "MEDIUM";
  if (balanceEth <= VERY_HIGH_BALANCE_ETH) return "HIGH";
  return "VERY HIGH";
}

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isValidAddressInput(value: string): boolean {
  return ADDRESS_RE.test(value.trim());
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
 * Keyless public mainnet endpoints, tried in order. Both were verified to
 * answer batched requests and to send `access-control-allow-origin: *`, which
 * they must, since these calls are made from the browser.
 *
 * The two endpoints the original brief suggested are no longer usable without
 * a key: cloudflare-eth.com now returns -32603 Internal error, and
 * rpc.ankr.com/eth answers -32000 "You must authenticate your request with an
 * API key". Re-check before swapping either back in.
 */
const RPC_ENDPOINTS = [
  "https://ethereum-rpc.publicnode.com",
  "https://rpc.flashbots.net",
];

const RPC_TIMEOUT_MS = 12_000;

interface RpcResponse {
  id: number;
  result?: string;
  error?: { code: number; message: string };
}

/**
 * Both reads in a single batched POST: one HTTP request per submit keeps this
 * friendly to endpoints that meter by request rather than by call.
 */
async function fetchAccountState(
  endpoint: string,
  address: string,
): Promise<{ nonceHex: string; balanceHex: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify([
        {
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getTransactionCount",
          params: [address, "latest"],
        },
        {
          jsonrpc: "2.0",
          id: 2,
          method: "eth_getBalance",
          params: [address, "latest"],
        },
      ]),
    });

    if (!response.ok) {
      throw new Error(`RPC ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("RPC returned a non-batch response");
    }

    const byId = new Map(
      (payload as RpcResponse[]).map((entry) => [entry.id, entry]),
    );
    const nonce = byId.get(1);
    const balance = byId.get(2);

    // A batch can return 200 with per-call errors, so check each one.
    for (const entry of [nonce, balance]) {
      if (entry?.error) throw new Error(entry.error.message);
    }
    if (!nonce?.result || !balance?.result) {
      throw new Error("RPC response missing a result");
    }

    return { nonceHex: nonce.result, balanceHex: balance.result };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wei is far past Number's integer range, so divide as BigInt first. Going via
 * micro-ETH keeps six decimals — comfortably more than the four we display —
 * while staying inside the safe integer range for any real balance.
 */
function weiToEth(hex: string): number {
  const microEth = BigInt(hex) / 1_000_000_000_000n;
  return Number(microEth) / 1_000_000;
}

export async function checkAddress(address: string): Promise<ExposureResult> {
  const target = address.trim();
  let lastError: unknown;

  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const { nonceHex, balanceHex } = await fetchAccountState(
        endpoint,
        target,
      );
      return {
        // Nonce counts transactions *sent*. Receiving funds never reveals a
        // public key, so a funded account that has never spent reads as not
        // yet exposed — which is exactly the distinction the verdict draws.
        exposed: BigInt(nonceHex) > 0n,
        balanceEth: weiToEth(balanceHex),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All RPC endpoints failed");
}
