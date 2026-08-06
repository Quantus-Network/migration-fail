/**
 * Exposure checker data layer.
 *
 * Fetches live address data from Task Master (same backend as quantus.com
 * quantum-risk-checker), then scores with the shared quantum-security-scorer
 * thresholds so both surfaces agree on risk.
 *
 * Exposure duration fields may be present on the API payload; they are unused
 * in the stamp UI and do not affect the numeric score (same as the website).
 */

import env from "@/config";
import type { EthereumAddressData } from "@/interfaces/EthereumSecurity";
import {
  formatEthBalance,
  generateSecurityAnalysis,
  type RiskLevelKey,
} from "@/lib/quantum-security-scorer";

export type Risk = "VERY LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";

const RISK_LABEL: Record<RiskLevelKey, Risk> = {
  very_low: "VERY LOW",
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  very_high: "VERY HIGH",
};

export interface ExposureResult {
  address: string;
  ensName?: string;
  /** ENS if present, otherwise a truncated resolved address. */
  displayLabel: string;
  /** True when outgoing txs published the public key and the account is not a contract. */
  exposed: boolean;
  balanceEth: number;
  risk: Risk;
}

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/** Non-empty input; address/ENS validity is left to Task Master. */
export function isValidCheckerInput(value: string): boolean {
  return value.trim().length > 0;
}

/** 0x1a2b…9f3c — enough of both ends to compare against a wallet by eye. */
export function truncateAddress(value: string): string {
  const v = value.trim();
  if (!ADDRESS_RE.test(v)) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export { formatEthBalance as formatEth };

function displayLabelFor(data: EthereumAddressData): string {
  if (data.ensName) return data.ensName;
  return truncateAddress(data.address);
}

async function fetchAddressData(
  addressOrEns: string,
): Promise<EthereumAddressData> {
  const response = await fetch(
    `${env.TASK_MASTER_URL}/risk-checker/${encodeURIComponent(addressOrEns)}`,
  );

  if (!response.ok) {
    throw new Error(`Risk checker ${response.status}`);
  }

  const payload: unknown = await response.json();
  const data =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data: unknown }).data;

  if (!data || typeof data !== "object") {
    throw new Error("Risk checker returned no data");
  }

  return data as EthereumAddressData;
}

export async function checkAddress(
  addressOrEns: string,
): Promise<ExposureResult> {
  const target = addressOrEns.trim();
  const addressData = await fetchAddressData(target);
  const analysis = generateSecurityAnalysis(addressData);

  return {
    address: analysis.address,
    ensName: addressData.ensName,
    displayLabel: displayLabelFor(addressData),
    exposed: analysis.analysisDetails.publicKeyExposed,
    balanceEth: addressData.balanceEth,
    risk: RISK_LABEL[analysis.securityScore.riskLevel],
  };
}
