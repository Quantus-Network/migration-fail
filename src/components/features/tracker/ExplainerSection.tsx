export function ExplainerSection() {
  const grokLink = (term: string, slug: string) => (
    <a
      href={`https://grokipedia.com/page/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white underline decoration-content-40 underline-offset-2 hover:decoration-flare transition-colors"
    >
      {term}
    </a>
  );

  return (
    <section className="py-12 border-t border-border mt-8">
      <h3 className="text-lg font-medium text-white mb-6 uppercase tracking-wider">
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
          {grokLink("Post-quantum cryptography", "Post-quantum_cryptography")}{" "}
          (PQC) refers to cryptographic algorithms that are believed to be
          secure against both classical and quantum computer attacks. These
          include {grokLink("lattice-based", "Lattice-based_cryptography")},{" "}
          {grokLink("hash-based", "Hash-based_cryptography")}, code-based, and multivariate
          polynomial cryptography.
        </p>

        <p>
          This tracker monitors how much of the total cryptocurrency market cap
          has migrated to quantum-resistant cryptographic solutions. As quantum
          computing advances, this migration will become increasingly critical
          for the security of digital assets.
        </p>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-medium text-content-60 uppercase tracking-wider mb-4">
          Learn More
        </h4>
        <ul className="space-y-2">
          <li>
            <a
              href="https://csrc.nist.gov/projects/post-quantum-cryptography"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              NIST Post-Quantum Cryptography Project
            </a>
            <span className="text-content-40 ml-2">
              - Standardization of PQC algorithms
            </span>
          </li>
          <li>
            <a
              href="https://www.quantus.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              Quantus
            </a>
            <span className="text-content-40 ml-2">
              - Post-quantum secure network
            </span>
          </li>
          <li>
            <a
              href="https://ecdsa.fail"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              ECDSA.fail
            </a>
            <span className="text-content-40 ml-2">
              - Quantum computing challenge for ECDSA
            </span>
          </li>
          <li>
            <a
              href="https://quantum.country"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              Quantum Country
            </a>
            <span className="text-content-40 ml-2">
              - Introduction to quantum computing
            </span>
          </li>
          <li>
            <a
              href="https://murmurationstwo.substack.com/p/if-the-quantum-canary-sings-its-too"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              If the Quantum Canary Sings, It's Too Late
            </a>
            <span className="text-content-40 ml-2">
              - Murmurationstwo
            </span>
          </li>
          <li>
            <a
              href="https://murmurationstwo.substack.com/p/bitcoin-and-the-quantum-problem-part"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              Bitcoin and the Quantum Problem (Part 1)
            </a>
            <span className="text-content-40 ml-2">
              - Murmurationstwo
            </span>
          </li>
          <li>
            <a
              href="https://murmurationstwo.substack.com/p/bitcoin-and-the-quantum-problem-part-47f"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              Bitcoin and the Quantum Problem (Part 2)
            </a>
            <span className="text-content-40 ml-2">
              - Murmurationstwo
            </span>
          </li>
          <li>
            <a
              href="https://murmurationstwo.substack.com/p/trillion-dollar-salvage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              Trillion Dollar Salvage
            </a>
            <span className="text-content-40 ml-2">
              - Murmurationstwo
            </span>
          </li>
          <li>
            <a
              href="https://store.steampowered.com/app/2802710/Quantum_Odyssey/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flare hover:opacity-80 transition-opacity"
            >
              Quantum Odyssey
            </a>
            <span className="text-content-40 ml-2">
              - Quantum computing puzzle game
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h4 className="text-sm font-medium text-content-60 uppercase tracking-wider mb-4">
          Methodology
        </h4>
        <div className="space-y-3 text-content-40 text-sm">
          <p>
            The percentage shown is calculated by dividing the combined market cap of 
            chains with native post-quantum cryptography by the total cryptocurrency 
            market cap, using data from CoinGecko.
          </p>
          <p>
            <strong className="text-content-70">Important limitations:</strong>
          </p>
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
