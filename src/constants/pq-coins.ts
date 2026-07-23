export interface PQCoin {
  id: string; // CoinGecko ID
  name: string;
  symbol: string;
  website: string;
  description: string;
  signature: string; // Post-quantum signature scheme; "(unverified)" flags a guess
}

export const PQ_COINS: PQCoin[] = [
  {
    id: "algorand",
    name: "Algorand",
    symbol: "ALGO",
    website: "https://www.algorand.com/",
    description: "State proofs with FALCON signatures",
    signature: "Falcon (state proofs)",
  },
  {
    id: "iota",
    name: "IOTA",
    symbol: "IOTA",
    website: "https://www.iota.org/",
    description: "Post-quantum signatures in development",
    signature: "PQC (unverified)",
  },
  {
    id: "quantum-resistant-ledger",
    name: "Quantum Resistant Ledger",
    symbol: "QRL",
    website: "https://www.theqrl.org/",
    description: "Purpose-built blockchain using XMSS hash-based signatures",
    signature: "XMSS",
  },
  {
    id: "abelian",
    name: "Abelian",
    symbol: "ABEL",
    website: "https://www.abelian.info/",
    description: "Lattice-based post-quantum privacy blockchain",
    signature: "Lattice-based (unverified)",
  },
  {
    id: "qanplatform",
    name: "QANplatform",
    symbol: "QANX",
    website: "https://qanplatform.com/",
    description: "Quantum-resistant hybrid blockchain platform",
    signature: "Lattice-based (unverified)",
  },
  {
    id: "cellframe",
    name: "Cellframe",
    symbol: "CELL",
    website: "https://cellframe.net/",
    description: "Post-quantum layer 1 network",
    signature: "CRYSTALS-Dilithium (unverified)",
  },
  {
    id: "xxcoin",
    name: "XX Network",
    symbol: "XX",
    website: "https://xx.network/",
    description: "Quantum-secure and privacy-focused blockchain",
    signature: "PQC (unverified)",
  },
  {
    id: "quantus",
    name: "Quantus",
    symbol: "QUAN",
    website: "https://www.quantus.com/",
    description: "Post-quantum secure blockchain network",
    signature: "PQC (unverified)",
  },
];

// Helper to get comma-separated IDs for API calls
export const PQ_COIN_IDS = PQ_COINS.map((c) => c.id).join(",");
