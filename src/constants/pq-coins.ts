export interface PQCoin {
  id: string; // CoinGecko ID
  name: string;
  symbol: string;
  website: string;
  description: string;
  signature: string; // Post-quantum signature scheme; "(unverified)" flags a guess
  /**
   * One plain-language sentence for non-technical readers: scheme family plus
   * quantum status, ~70 chars.
   *
   * This describes whatever `signature` states, and must NEVER contain the
   * word "Unverified" — that flag belongs only in the "(unverified)" suffix on
   * `signature` itself. The uncertainty is about which scheme a project ships,
   * not about what the cryptography is; a reader who sees "Lattice-based
   * (unverified)" still deserves to be told what lattice-based means.
   *
   * Empty string renders no explainer line at all.
   */
  explainer: string;
}

export const PQ_COINS: PQCoin[] = [
  {
    id: "algorand",
    name: "Algorand",
    symbol: "ALGO",
    website: "https://www.algorand.com/",
    description: "State proofs with FALCON signatures",
    signature: "Falcon (state proofs)",
    explainer: "Lattice-based signatures. Designed to resist quantum computers.",
  },
  {
    id: "iota",
    name: "IOTA",
    symbol: "IOTA",
    website: "https://www.iota.org/",
    description: "Post-quantum signatures in development",
    // Verified against the IOTA TIP for the Ed25519 signature scheme: Chrysalis
    // replaced the old hash-based W-OTS entirely with Ed25519, which is NOT
    // quantum-resistant. Kept in this table pending an editorial call, since
    // removing a coin changes the headline percentage.
    signature: "Ed25519",
    explainer: "Elliptic-curve signatures. Breakable by a future quantum computer.",
  },
  {
    id: "quantum-resistant-ledger",
    name: "Quantum Resistant Ledger",
    symbol: "QRL",
    website: "https://www.theqrl.org/",
    description: "Purpose-built blockchain using XMSS hash-based signatures",
    signature: "XMSS",
    explainer: "Hash-based signatures. Quantum-resistant.",
  },
  {
    id: "abelian",
    name: "Abelian",
    symbol: "ABEL",
    website: "https://www.abelian.info/",
    description: "Lattice-based post-quantum privacy blockchain",
    // Abelian Foundation documents lattice-based linkable ring signatures built
    // on the CRYSTALS-Dilithium primitives.
    signature: "Lattice-based ring signatures (Dilithium)",
    explainer: "Lattice-based signatures. Designed to resist quantum computers.",
  },
  {
    id: "qanplatform",
    name: "QANplatform",
    symbol: "QANX",
    website: "https://qanplatform.com/",
    description: "Quantum-resistant hybrid blockchain platform",
    // learn.qanplatform.com states ML-DSA (CRYSTALS-Dilithium), used via QAN XLINK.
    signature: "CRYSTALS-Dilithium (ML-DSA)",
    explainer: "Lattice-based signatures. Designed to resist quantum computers.",
  },
  {
    id: "cellframe",
    name: "Cellframe",
    symbol: "CELL",
    website: "https://cellframe.net/",
    description: "Post-quantum layer 1 network",
    // Cellframe's wiki lists Dilithium, Falcon, SPHINCS+ and Shipovnik as
    // selectable; Dilithium is the documented default, hence the qualifier.
    signature: "CRYSTALS-Dilithium (default)",
    explainer: "Lattice-based signatures. Designed to resist quantum computers.",
  },
  {
    id: "xxcoin",
    name: "XX Network",
    symbol: "XX",
    website: "https://xx.network/",
    description: "Quantum-secure and privacy-focused blockchain",
    // xx network signs transactions with Substrate's default sr25519 today; the
    // quantum-secure WOTS+ path currently lives in Sleeve wallet generation and
    // is slated to become the default signing scheme, not yet shipped as one.
    signature: "sr25519 (WOTS+ planned)",
    explainer: "Elliptic-curve signatures today; hash-based ones are planned.",
  },
  {
    id: "quantus",
    name: "Quantus",
    symbol: "QUAN",
    website: "https://www.quantus.com/",
    description: "Post-quantum secure blockchain network",
    // ML-DSA-87 per the Quantus whitepaper and the qp-rusty-crystals repo.
    signature: "ML-DSA-87 (Dilithium)",
    explainer: "Lattice-based signatures. Designed to resist quantum computers.",
  },
];

// Helper to get comma-separated IDs for API calls
export const PQ_COIN_IDS = PQ_COINS.map((c) => c.id).join(",");
