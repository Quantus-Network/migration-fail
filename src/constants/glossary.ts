/**
 * Plain-language definitions for the technical terms in the explainer prose.
 *
 * Constraints, because these render in a small floating tooltip: ONE sentence,
 * ~120 characters max, no history, no proper names, no dates. Say what the
 * thing is and why it matters here — nothing else fits, and anything longer
 * turns the card into a banner that covers the paragraph being read.
 *
 * Plain text only: no markup, no links, no nested terms.
 */
export const GLOSSARY: Record<string, string> = {
  ECDSA:
    "The signature scheme securing most crypto today. A quantum computer could break it.",

  "quantum computers":
    "Machines that use quantum physics to solve certain problems no ordinary computer can.",

  "Shor's algorithm":
    "The quantum method that would break the encryption most crypto relies on.",

  "post-quantum cryptography":
    "Encryption designed to stay secure even against quantum computers.",

  "lattice-based":
    "A family of cryptography believed to resist quantum computers.",

  "hash-based":
    "Cryptography built from hash functions, believed to resist quantum computers.",

  "code-based":
    "Cryptography built from error-correcting codes, believed to resist quantum computers.",

  "multivariate polynomial cryptography":
    "Cryptography built from systems of equations; some versions have been broken.",

  "public keys":
    "The shareable half of a key pair; the secret half is what authorises spending.",

  // Signature schemes named in Exhibit C. ECDSA is defined above and covers
  // both its Exhibit B and Exhibit C appearances.
  "Dilithium-5":
    "Lattice-based signatures at the strongest NIST setting. The most widely adopted post-quantum choice.",

  "Dilithium-3":
    "The same lattice scheme at a lower setting: smaller keys, lower rated strength.",

  "Falcon-1024":
    "Compact lattice-based signatures, awaiting final NIST standardization.",

  "Falcon-512":
    "The lighter Falcon setting: the smallest post-quantum signatures here, at lower rated strength.",

  XMSS: "Hash-based signatures. Quantum-resistant, but each key can sign only a set number of times.",

  "WOTS+":
    "Hash-based signatures where each key is designed to sign only once.",

  Schnorr:
    "Classical elliptic-curve signatures, used by Bitcoin. Quantum-breakable.",

  Ed25519:
    "Classical elliptic-curve signatures, fast and widely used. Quantum-breakable.",

  // Column headers in the signature scheme specification table. Distinct from
  // "public keys" above, which explains the key pair in prose; these explain
  // what the byte figure under each header costs the reader.
  "Public Key":
    "The key others use to verify your signature. Bigger keys mean bulkier transactions.",

  Signature:
    "The proof attached to every transaction. Its size directly drives fees.",

  // Exhibit C renders the L-value of each scheme as a glossary term.
  "NIST level 5":
    "NIST security level 5, the highest standardized strength.",

  "NIST level 3":
    "NIST security level 3, a middle standardized strength.",

  "NIST level 1":
    "NIST security level 1, the lowest standardized strength.",
};

export function getDefinition(term: string): string | undefined {
  return GLOSSARY[term];
}
