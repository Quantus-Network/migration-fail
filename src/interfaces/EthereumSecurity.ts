/** Matches website/website/src/interfaces/EthereumSecurity.ts (Task Master payload). */

export interface EthereumAddressData {
  address: string;
  ensName?: string;
  balance: string;
  balanceEth: number;
  hasOutgoingTransactions: boolean;
  /** Unix timestamp of first outgoing transaction. Unused in stamp UI v1. */
  firstTransactionTimestamp?: number;
  /** Days since public key was exposed. Unused in stamp UI v1 (does not affect score). */
  daysSinceFirstTransaction?: number;
  isSmartContract: boolean;
}

export interface QuantumSecurityScore {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "E" | "F";
  riskLevel: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  recommendations: string[];
}

export interface EthereumSecurityAnalysis {
  address: string;
  addressData: EthereumAddressData;
  securityScore: QuantumSecurityScore;
  analysisDetails: {
    publicKeyExposed: boolean;
    balanceRiskFactor: number;
    exposureDurationRisk: number;
    daysSinceExposure?: number;
  };
}
