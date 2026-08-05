import { GlossaryTerm } from "./GlossaryTerm";

/** Register 2 — navigation links. Held as data so the arrow prefix and hover
 *  underline are defined once rather than repeated per item. */
const LEARN_MORE: { href: string; label: string; note: string }[] = [
  {
    href: "https://csrc.nist.gov/projects/post-quantum-cryptography",
    label: "NIST Post-Quantum Cryptography Project",
    note: "Standardization of PQC algorithms",
  },
  {
    href: "https://www.quantus.com/",
    label: "Quantus",
    note: "Post-quantum secure network",
  },
  {
    href: "https://ecdsa.fail",
    label: "ECDSA.fail",
    note: "Quantum computing challenge for ECDSA",
  },
  {
    href: "https://quantum.country",
    label: "Quantum Country",
    note: "Introduction to quantum computing",
  },
  {
    href: "https://murmurationstwo.substack.com/p/if-the-quantum-canary-sings-its-too",
    label: "If the Quantum Canary Sings, It's Too Late",
    note: "Murmurationstwo",
  },
  {
    href: "https://murmurationstwo.substack.com/p/bitcoin-and-the-quantum-problem-part",
    label: "Bitcoin and the Quantum Problem (Part 1)",
    note: "Murmurationstwo",
  },
  {
    href: "https://murmurationstwo.substack.com/p/bitcoin-and-the-quantum-problem-part-47f",
    label: "Bitcoin and the Quantum Problem (Part 2)",
    note: "Murmurationstwo",
  },
  {
    href: "https://murmurationstwo.substack.com/p/trillion-dollar-salvage",
    label: "Trillion Dollar Salvage",
    note: "Murmurationstwo",
  },
  {
    href: "https://store.steampowered.com/app/2802710/Quantum_Odyssey/",
    label: "Quantum Odyssey",
    note: "Quantum computing puzzle game",
  },
];

export function ExplainerSection() {
  /** Linked term: hover previews the glossary definition, click still opens the
   *  external page. `key` looks up the definition; `term` is what's displayed. */
  const grokLink = (term: string, slug: string, key = term) => (
    <GlossaryTerm term={key} href={`https://grokipedia.com/page/${slug}`}>
      {term}
    </GlossaryTerm>
  );

  /** Unlinked term: tooltip only, same underline for a consistent affordance. */
  const glossaryOnly = (term: string, key = term) => (
    <GlossaryTerm term={key}>{term}</GlossaryTerm>
  );

  return (
    <section className="py-12 border-t border-border mt-8">
      <h3 className="text-sm font-medium text-content mb-6 uppercase">
        What is Post-Quantum Cryptography?
      </h3>

      <div className="space-y-4 text-content-70 max-w-3xl">
        <p>
          Most cryptocurrencies today rely on{" "}
          {grokLink("ECDSA", "Elliptic_Curve_Digital_Signature_Algorithm")} (Elliptic Curve Digital
          Signature Algorithm) or similar cryptographic algorithms to secure
          transactions and wallets. These algorithms could potentially be broken
          by sufficiently powerful {grokLink("quantum computers", "Quantum_computing")} using{" "}
          {grokLink("Shor's algorithm", "Shor's_algorithm")}.
        </p>

        <p>
          {grokLink(
            "Post-quantum cryptography",
            "Post-quantum_cryptography",
            "post-quantum cryptography",
          )}{" "}
          (PQC) refers to cryptographic algorithms that are believed to be
          secure against both classical and quantum computer attacks. These
          include {grokLink("lattice-based", "Lattice-based_cryptography")},{" "}
          {grokLink("hash-based", "Hash-based_cryptography")},{" "}
          {glossaryOnly("code-based")}, and{" "}
          {glossaryOnly("multivariate polynomial cryptography")}.
        </p>

        <p>
          This tracker monitors how much of the total cryptocurrency market cap
          has migrated to quantum-resistant cryptographic solutions. As quantum
          computing advances, this migration will become increasingly critical
          for the security of digital assets.
        </p>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-medium text-content-60 uppercase mb-4">
          Learn More
        </h4>
        <ul className="space-y-2">
          {LEARN_MORE.map((item) => (
            <li key={item.href}>
              {/* Register 2 — navigation. The arrow is the rest affordance, so
                  the underline is reserved for hover. Kept outside the anchor
                  so it isn't underlined along with the label. */}
              <span className="text-content-40" aria-hidden="true">
                &rarr;{" "}
              </span>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-flare hover:underline decoration-1 underline-offset-2 transition-colors"
              >
                {item.label}
              </a>
              <span className="text-content-40 ml-2">- {item.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h4 className="text-sm font-medium text-content-60 uppercase mb-4">
          Methodology
        </h4>
        <div className="space-y-3 text-content-40 text-sm">
          <p>
            The percentage shown is calculated by dividing the combined market cap of 
            chains with native post-quantum cryptography by the total cryptocurrency 
            market cap, using data from CoinGecko.
          </p>
          {/* Sub-label of Methodology, so h5 under that h4 rather than a
              bolded paragraph. font-normal and the explicit colour are needed
              to beat global.css, which gives every h1-h6 weight 500 and full
              content brightness. */}
          <h5 className="font-normal uppercase text-sm text-content-40">
            Important limitations
          </h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              This metric uses total chain market cap and does not account for 
              individual address types within each chain
            </li>
            <li>
              Addresses that have been reused or have exposed{" "}
              {grokLink("public keys", "Public-key_cryptography")} may be 
              more vulnerable, even on PQ-secure chains
            </li>
            <li>
              Some chains listed may have PQ features that are optional or not yet 
              fully deployed
            </li>
            <li>
              Wrapped tokens, bridges, and layer 2 solutions may have different 
              security properties than their base chains
            </li>
          </ul>
          <p className="pt-2">
            This tracker is intended as a high-level indicator of industry migration 
            toward post-quantum security, not as a definitive security assessment.
          </p>
        </div>
      </div>
    </section>
  );
}
