// Signature schemes for the top-20 (all quantum-vulnerable) chains, keyed by
// CoinGecko id. Bare names are confident; "(unverified)" / the "PQC
// (unverified)" fallback flag values that should be checked against each
// project's docs. Tokens are mapped to their primary host chain's scheme.
export const TOP_COIN_SIGNATURES: Record<string, string> = {
  bitcoin: "ECDSA secp256k1",
  ethereum: "ECDSA secp256k1",
  tether: "ECDSA secp256k1",
  ripple: "ECDSA/Ed25519",
  binancecoin: "ECDSA secp256k1",
  solana: "Ed25519",
  "usd-coin": "ECDSA secp256k1",
  "staked-ether": "ECDSA secp256k1",
  dogecoin: "ECDSA secp256k1",
  cardano: "Ed25519",
  tron: "ECDSA secp256k1",
  "wrapped-bitcoin": "ECDSA secp256k1",
  "wrapped-steth": "ECDSA secp256k1",
  "avalanche-2": "ECDSA secp256k1",
  chainlink: "ECDSA secp256k1",
  polkadot: "sr25519/Ed25519",
  "the-open-network": "Ed25519",
  "shiba-inu": "ECDSA secp256k1",
  sui: "Ed25519",
  litecoin: "ECDSA secp256k1",
  "bitcoin-cash": "ECDSA secp256k1",
  "hedera-hashgraph": "Ed25519",
  stellar: "Ed25519",
  monero: "EdDSA (Ed25519)",
  aptos: "Ed25519",
  near: "Ed25519",
  cosmos: "ECDSA secp256k1",
  uniswap: "ECDSA secp256k1",
  dai: "ECDSA secp256k1",
  "ethena-usde": "ECDSA secp256k1",
  "internet-computer": "Ed25519/BLS (unverified)",
  "matic-network": "ECDSA secp256k1",
  "polygon-ecosystem-token": "ECDSA secp256k1",
  mantle: "ECDSA secp256k1",
  "crypto-com-chain": "ECDSA secp256k1",
  "leo-token": "ECDSA secp256k1",
  okb: "ECDSA secp256k1",
  whitebit: "ECDSA secp256k1",
  pepe: "ECDSA secp256k1",
  "first-digital-usd": "ECDSA secp256k1",
};

export function getTopCoinSignature(id: string): string {
  return TOP_COIN_SIGNATURES[id] ?? "PQC (unverified)";
}
