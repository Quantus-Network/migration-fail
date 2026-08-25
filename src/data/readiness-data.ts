/**
 * Exhibit C dataset — quantum readiness assessment.
 *
 * Grades, statuses and signature schemes are Quantum Canary's assessment, not
 * ours, and grade only current adoption of standardized post-quantum
 * cryptography — not project quality or non-quantum security.
 *
 * Dimension states come from the article's capability matrix where it states
 * them outright. Everywhere else they are derived from the grade, the scheme
 * and the article's prose, and carry `uncertain: true`. Uncertain evidence is
 * deliberately neutral: it describes what is known, never asserts a finding.
 */

export const READINESS_SOURCE_URL =
  "https://www.quantumcanary.org/is-your-blockchain-quantum-ready";
export const READINESS_DATA_AS_OF = "2026-02";

export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";
export type ChainStatus = "Testnet" | "Mainnet";
export type DimensionKey = "sigs" | "p2p" | "consensus" | "zk" | "privacy";

export interface Dimension {
  state: "pass" | "fail";
  /** One line, plain language, no jargon. Neutral when `uncertain`. */
  evidence: string;
  /** True when derived rather than stated by the source. */
  uncertain?: boolean;
}

export interface ReadinessChain {
  name: string;
  ticker: string;
  grade: Grade;
  status: ChainStatus;
  /** Display form, e.g. "Dilithium-5". */
  scheme: string;
  /** NIST security level claimed for that scheme: 1, 3 or 5. */
  nistLevel: 1 | 3 | 5;
  dimensions: Record<DimensionKey, Dimension>;
}

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  sigs: "Transaction signatures",
  p2p: "Peer-to-peer connections",
  consensus: "Consensus mechanism",
  zk: "Zero-knowledge proofs",
  privacy: "Privacy features",
};

/** Every dimension classically secured — the shape of a D/F row. */
function allClassical(scheme: string): Record<DimensionKey, Dimension> {
  return {
    sigs: {
      state: "fail",
      evidence: `Transactions are signed with ${scheme}, which a quantum computer could break.`,
    },
    p2p: {
      state: "fail",
      evidence: "No post-quantum protection documented for peer connections.",
      uncertain: true,
    },
    consensus: {
      state: "fail",
      evidence: "No post-quantum protection documented for block validation.",
      uncertain: true,
    },
    zk: {
      state: "fail",
      evidence: "No post-quantum zero-knowledge proof system documented.",
      uncertain: true,
    },
    privacy: {
      state: "fail",
      evidence: "No post-quantum privacy features documented.",
      uncertain: true,
    },
  };
}

/** Post-quantum signatures in place, the rest undocumented — the C-grade shape. */
function pqSigsOnly(scheme: string): Record<DimensionKey, Dimension> {
  return {
    sigs: {
      state: "pass",
      evidence: `Transactions are signed with ${scheme}, a post-quantum scheme.`,
    },
    p2p: {
      state: "fail",
      evidence: "No post-quantum protection documented for peer connections.",
      uncertain: true,
    },
    consensus: {
      state: "fail",
      evidence: "No post-quantum protection documented for block validation.",
      uncertain: true,
    },
    zk: {
      state: "fail",
      evidence: "No post-quantum zero-knowledge proof system documented.",
      uncertain: true,
    },
    privacy: {
      state: "fail",
      evidence: "No post-quantum privacy features documented.",
      uncertain: true,
    },
  };
}

export const READINESS_CHAINS: ReadinessChain[] = [
  {
    name: "Quantus Network",
    ticker: "QUAN",
    grade: "A+",
    status: "Testnet",
    scheme: "Dilithium-5",
    nistLevel: 5,
    dimensions: {
      sigs: {
        state: "pass",
        evidence: "Transactions are signed with Dilithium-5, a lattice scheme.",
      },
      p2p: {
        state: "pass",
        evidence: "Peer connections use post-quantum key exchange.",
      },
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
      zk: {
        state: "pass",
        evidence: "Proof system is built on quantum-resistant foundations.",
      },
      privacy: {
        state: "pass",
        evidence: "Privacy features use post-quantum cryptography.",
      },
    },
  },
  {
    name: "Cellframe Network",
    ticker: "CELL",
    grade: "A+",
    status: "Mainnet",
    scheme: "Dilithium-5",
    nistLevel: 5,
    dimensions: {
      sigs: {
        state: "pass",
        evidence: "Transactions are signed with Dilithium-5, a lattice scheme.",
      },
      p2p: {
        state: "pass",
        evidence: "Peer connections use post-quantum key exchange.",
      },
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
      zk: {
        state: "pass",
        evidence: "Proof system is built on quantum-resistant foundations.",
      },
      privacy: {
        state: "pass",
        evidence: "Privacy features use post-quantum cryptography.",
      },
    },
  },
  {
    name: "XX Network",
    ticker: "XX",
    grade: "A",
    status: "Mainnet",
    scheme: "WOTS+",
    nistLevel: 5,
    dimensions: {
      sigs: {
        state: "pass",
        evidence: "Transactions are signed with WOTS+, a hash-based scheme.",
      },
      p2p: {
        state: "pass",
        evidence: "Peer connections use post-quantum key exchange.",
      },
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
      zk: {
        state: "fail",
        evidence: "No post-quantum zero-knowledge proof system.",
      },
      privacy: {
        state: "pass",
        evidence: "Privacy features use post-quantum cryptography.",
      },
    },
  },
  {
    name: "Abelian",
    ticker: "ABEL",
    grade: "A",
    status: "Mainnet",
    scheme: "Dilithium-3",
    nistLevel: 3,
    dimensions: {
      sigs: {
        state: "pass",
        evidence: "Transactions are signed with Dilithium-3, a lattice scheme.",
      },
      p2p: {
        state: "fail",
        evidence: "Peer connections still rely on classical key exchange.",
      },
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
      zk: {
        state: "pass",
        evidence: "Proof system is built on quantum-resistant foundations.",
      },
      privacy: {
        state: "pass",
        evidence: "Privacy features use post-quantum cryptography.",
      },
    },
  },
  {
    name: "Quantum Resistant Ledger",
    ticker: "QRL",
    grade: "B",
    status: "Mainnet",
    scheme: "XMSS",
    nistLevel: 5,
    dimensions: {
      sigs: {
        state: "pass",
        evidence: "Transactions are signed with XMSS, a hash-based scheme.",
      },
      p2p: {
        state: "pass",
        evidence: "Peer connections use post-quantum key exchange.",
      },
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
      zk: {
        state: "fail",
        evidence: "No post-quantum zero-knowledge proof system.",
      },
      privacy: {
        state: "fail",
        evidence: "No post-quantum privacy features.",
      },
    },
  },
  {
    name: "Starknet",
    ticker: "STRK",
    grade: "C",
    status: "Mainnet",
    scheme: "Falcon-512",
    nistLevel: 1,
    dimensions: {
      sigs: {
        state: "pass",
        evidence: "Transactions are signed with Falcon-512, a post-quantum scheme.",
      },
      p2p: {
        state: "fail",
        evidence: "No post-quantum protection documented for peer connections.",
        uncertain: true,
      },
      consensus: {
        state: "fail",
        evidence: "No post-quantum protection documented for block validation.",
        uncertain: true,
      },
      // The article names StarkNet's zk-STARKs as the example of genuinely
      // post-quantum ZK, in contrast to elliptic-curve zk-SNARKs.
      zk: {
        state: "pass",
        evidence: "Uses zk-STARKs, which rest on hashes rather than curves.",
      },
      privacy: {
        state: "pass",
        evidence: "Privacy features use post-quantum cryptography.",
      },
    },
  },
  {
    name: "Nexus",
    ticker: "NXS",
    grade: "C",
    status: "Mainnet",
    scheme: "Falcon-512",
    nistLevel: 1,
    dimensions: pqSigsOnly("Falcon-512"),
  },
  {
    name: "Zcash",
    ticker: "ZEC",
    grade: "C",
    status: "Mainnet",
    scheme: "ECDSA",
    nistLevel: 1,
    dimensions: {
      sigs: {
        state: "fail",
        evidence:
          "Transactions are signed with ECDSA, which a quantum computer could break.",
      },
      p2p: {
        state: "fail",
        evidence: "No post-quantum protection documented for peer connections.",
        uncertain: true,
      },
      consensus: {
        state: "pass",
        evidence: "The consensus mechanism uses post-quantum primitives.",
      },
      // Called out by name in the article: zk-SNARKs are advanced but their
      // primitives are elliptic curves, so they are not post-quantum.
      zk: {
        state: "fail",
        evidence: "Uses zk-SNARKs, which rest on quantum-vulnerable curves.",
      },
      privacy: {
        state: "pass",
        evidence: "Privacy features use post-quantum cryptography.",
      },
    },
  },
  {
    name: "QANplatform",
    ticker: "QANX",
    grade: "C",
    status: "Mainnet",
    scheme: "Dilithium-5",
    nistLevel: 5,
    dimensions: {
      ...pqSigsOnly("Dilithium-5"),
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
    },
  },
  {
    name: "Mochimo",
    ticker: "MCM",
    grade: "C",
    status: "Mainnet",
    scheme: "WOTS+",
    nistLevel: 5,
    dimensions: pqSigsOnly("WOTS+"),
  },
  {
    name: "IOTA",
    ticker: "IOTA",
    grade: "C",
    status: "Mainnet",
    scheme: "Dilithium-5",
    nistLevel: 5,
    dimensions: allClassical("Ed25519"),
  },
  // Not in the February 2026 Quantum Canary table. nearcore upgrade 2.13
  // (protocol v85, July 2026) accepted FIPS 204 ML-DSA-65 — Dilithium-3 —
  // for transactions and access keys. Existing ed25519 / secp256k1 stay;
  // validator keys remain ed25519. See pq-coins.ts and
  // nearcore docs/architecture/how/post_quantum_signatures.md.
  {
    name: "NEAR Protocol",
    ticker: "NEAR",
    grade: "C",
    status: "Mainnet",
    scheme: "Dilithium-3",
    nistLevel: 3,
    dimensions: {
      sigs: {
        state: "pass",
        evidence:
          "Accounts can sign with Dilithium-3, a post-quantum scheme.",
      },
      p2p: {
        state: "fail",
        evidence: "No post-quantum protection documented for peer connections.",
        uncertain: true,
      },
      consensus: {
        state: "fail",
        evidence:
          "Validator keys remain Ed25519, which a quantum computer could break.",
      },
      zk: {
        state: "fail",
        evidence: "No post-quantum zero-knowledge proof system documented.",
        uncertain: true,
      },
      privacy: {
        state: "fail",
        evidence: "No post-quantum privacy features documented.",
        uncertain: true,
      },
    },
  },
  {
    name: "Bitcoin",
    ticker: "BTC",
    grade: "D",
    status: "Mainnet",
    scheme: "Schnorr",
    nistLevel: 1,
    dimensions: {
      ...allClassical("Schnorr"),
      consensus: {
        state: "pass",
        evidence: "The consensus mechanism uses post-quantum primitives.",
      },
    },
  },
  {
    name: "Algorand",
    ticker: "ALGO",
    grade: "D",
    status: "Mainnet",
    scheme: "Falcon-1024",
    nistLevel: 5,
    dimensions: {
      ...pqSigsOnly("Falcon-1024"),
      consensus: {
        state: "pass",
        evidence: "Block validation uses post-quantum primitives throughout.",
      },
    },
  },
  {
    name: "Hedera",
    ticker: "HBAR",
    grade: "D",
    status: "Mainnet",
    scheme: "Ed25519",
    nistLevel: 1,
    dimensions: allClassical("Ed25519"),
  },
  {
    name: "Monero",
    ticker: "XMR",
    grade: "D",
    status: "Mainnet",
    scheme: "Ed25519",
    nistLevel: 1,
    dimensions: {
      ...allClassical("Ed25519"),
      consensus: {
        state: "pass",
        evidence: "The consensus mechanism uses post-quantum primitives.",
      },
      privacy: {
        state: "fail",
        evidence: "Ring signatures rest on the same quantum-vulnerable curves.",
        uncertain: true,
      },
    },
  },
  {
    name: "Ethereum",
    ticker: "ETH",
    grade: "F",
    status: "Mainnet",
    scheme: "ECDSA",
    nistLevel: 1,
    dimensions: allClassical("ECDSA"),
  },
  {
    name: "Solana",
    ticker: "SOL",
    grade: "F",
    status: "Mainnet",
    scheme: "Ed25519",
    nistLevel: 1,
    dimensions: allClassical("Ed25519"),
  },
];

export interface SchemeSpec {
  scheme: string;
  type: "PQ" | "Classical";
  level: 1 | 3 | 5;
  publicKeyBytes: number;
  signatureBytes: number;
}

/** Second table from the same source, in the article's order. */
export const SCHEME_SPECS: SchemeSpec[] = [
  { scheme: "Falcon-1024", type: "PQ", level: 5, publicKeyBytes: 1793, signatureBytes: 1280 },
  { scheme: "Dilithium-5", type: "PQ", level: 5, publicKeyBytes: 2592, signatureBytes: 4595 },
  { scheme: "XMSS", type: "PQ", level: 5, publicKeyBytes: 64, signatureBytes: 2500 },
  { scheme: "WOTS+", type: "PQ", level: 5, publicKeyBytes: 2144, signatureBytes: 2144 },
  { scheme: "Dilithium-3", type: "PQ", level: 3, publicKeyBytes: 1952, signatureBytes: 3293 },
  { scheme: "ECDSA", type: "Classical", level: 1, publicKeyBytes: 64, signatureBytes: 64 },
  { scheme: "Schnorr", type: "Classical", level: 1, publicKeyBytes: 33, signatureBytes: 64 },
  { scheme: "Falcon-512", type: "PQ", level: 1, publicKeyBytes: 897, signatureBytes: 666 },
  { scheme: "Ed25519", type: "Classical", level: 1, publicKeyBytes: 32, signatureBytes: 64 },
];

/** Badge tone per grade band: A sage, B/C gamboge, D/F flare. */
export function gradeTone(grade: Grade): { text: string; bg: string } {
  if (grade === "A+" || grade === "A") {
    return { text: "text-sage", bg: "bg-sage/15" };
  }
  if (grade === "B" || grade === "C") {
    return { text: "text-gamboge", bg: "bg-gamboge/15" };
  }
  return { text: "text-flare", bg: "bg-flare/15" };
}
