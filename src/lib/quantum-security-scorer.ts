/**
 * Port of website/website/src/scripts/risk-checker/quantum-security-scorer.ts.
 * Keep thresholds and penalties identical so PQ Tracker and quantus.com agree.
 */

import type {
  EthereumAddressData,
  EthereumSecurityAnalysis,
  QuantumSecurityScore,
} from "@/interfaces/EthereumSecurity";

export type RiskLevelKey = "very_low" | "low" | "medium" | "high" | "very_high";

export type RecommendationKey =
  | "smart_contract"
  | "public_key_exposed"
  | "public_key_safe"
  | "balance_very_high"
  | "balance_high"
  | "balance_medium"
  | "balance_low"
  | "receive_only"
  | "empty_address";

export interface QuantumSecurityScoreI18n extends Omit<
  QuantumSecurityScore,
  "riskLevel" | "recommendations"
> {
  riskLevel: RiskLevelKey;
  recommendations: RecommendationKey[];
}

export interface EthereumSecurityAnalysisI18n extends Omit<
  EthereumSecurityAnalysis,
  "securityScore"
> {
  securityScore: QuantumSecurityScoreI18n;
}

const getGrade = (score: number): QuantumSecurityScore["grade"] => {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  if (score >= 35) return "D";
  return "F";
};

const getRiskLevelKey = (score: number): RiskLevelKey => {
  if (score >= 90) return "very_low";
  if (score >= 75) return "low";
  if (score >= 60) return "medium";
  if (score >= 40) return "high";
  return "very_high";
};

export const calculateQuantumSecurityScore = (
  addressData: EthereumAddressData,
): QuantumSecurityScoreI18n => {
  let score = 100;
  const recommendations: RecommendationKey[] = [];

  if (addressData.isSmartContract) {
    recommendations.push("smart_contract");
  } else {
    const publicKeyExposedPenalty = addressData.hasOutgoingTransactions
      ? 40
      : 0;
    score -= publicKeyExposedPenalty;

    if (addressData.hasOutgoingTransactions) {
      recommendations.push("public_key_exposed");
    } else {
      recommendations.push("public_key_safe");
    }

    let balanceRiskFactor = 0;

    if (addressData.balanceEth > 10000) {
      balanceRiskFactor = 55;
      recommendations.push("balance_very_high");
    } else if (addressData.balanceEth > 1000) {
      balanceRiskFactor = 40;
      recommendations.push("balance_high");
    } else if (addressData.balanceEth > 100) {
      balanceRiskFactor = 30;
      recommendations.push("balance_medium");
    } else if (addressData.balanceEth > 10) {
      balanceRiskFactor = 20;
      recommendations.push("balance_low");
    } else if (addressData.balanceEth > 1) {
      balanceRiskFactor = 10;
    } else if (addressData.balanceEth > 0) {
      balanceRiskFactor = 5;
    }

    score -= balanceRiskFactor;

    if (!addressData.hasOutgoingTransactions && addressData.balanceEth > 0) {
      recommendations.push("receive_only");
    }

    if (addressData.balanceEth === 0) {
      recommendations.push("empty_address");
    }
  }

  score = Math.max(0, score);

  return {
    score: Math.round(score),
    grade: getGrade(score),
    riskLevel: getRiskLevelKey(score),
    recommendations,
  };
};

export const generateSecurityAnalysis = (
  addressData: EthereumAddressData,
): EthereumSecurityAnalysisI18n => {
  const securityScore = calculateQuantumSecurityScore(addressData);

  const publicKeyExposed =
    addressData.hasOutgoingTransactions && !addressData.isSmartContract;

  // Exposure duration is computed for analysis details parity with the website
  // scorer, but it does not change the numeric score (same as website).
  let exposureDurationRisk = 0;
  if (addressData.daysSinceFirstTransaction) {
    const days = addressData.daysSinceFirstTransaction;
    if (days > 365 * 2) exposureDurationRisk = 1.0;
    else if (days > 365) exposureDurationRisk = 0.8;
    else if (days > 180) exposureDurationRisk = 0.6;
    else if (days > 90) exposureDurationRisk = 0.4;
    else if (days > 30) exposureDurationRisk = 0.2;
  }

  let balanceRiskFactor = 0;
  if (addressData.balanceEth > 1000) balanceRiskFactor = 1;
  else if (addressData.balanceEth > 100) balanceRiskFactor = 0.8;
  else if (addressData.balanceEth > 10) balanceRiskFactor = 0.6;
  else if (addressData.balanceEth > 1) balanceRiskFactor = 0.4;
  else if (addressData.balanceEth > 0) balanceRiskFactor = 0.2;

  return {
    address: addressData.address,
    addressData,
    securityScore,
    analysisDetails: {
      publicKeyExposed,
      balanceRiskFactor,
      exposureDurationRisk,
      daysSinceExposure: addressData.daysSinceFirstTransaction,
    },
  };
};

export const formatEthBalance = (balance: number): string => {
  if (balance === 0) return "0 ETH";
  if (balance < 0.001) return `${balance.toExponential(2)} ETH`;
  if (balance < 1) return `${balance.toFixed(4)} ETH`;
  if (balance < 1000) return `${balance.toFixed(2)} ETH`;
  return `${balance.toLocaleString()} ETH`;
};
