const activeVectors = [
  "Edge-PQC Enveloping",
  "Markov-Bounded Quarantine",
  "zk-PoU Telemetry",
  "WASM Memory Sandboxing",
  "Algorithmic Autonomy Horizon",
];

export default function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">QMetaRm 2026</p>
        <h1>Quantum-ready control plane for the Q-NET ecosystem.</h1>
        <p className="lede">
          This workspace is now running from a unified monorepo baseline with Guardian specs,
          light-node generation, and edge-runtime scaffolding in place.
        </p>
      </section>

      <section className="panel">
        <h2>Operational Focus</h2>
        <ul>
          {activeVectors.map((vector) => (
            <li key={vector}>{vector}</li>
          ))}
        </ul>
      </section>

      <section className="grid">
        <article className="card">
          <h3>Cognitive Latency Horizon</h3>
          <p>Target bounded containment at P95 under 80 ms without removing human override authority.</p>
        </article>
        <article className="card">
          <h3>Guardian Core</h3>
          <p>State machine, Markov quarantine scoring, and auditable recovery path now defined in core docs.</p>
        </article>
        <article className="card">
          <h3>Edge Runtime</h3>
          <p>Hybrid classical plus PQC envelope and WASM execution contract prepared for next implementation step.</p>
        </article>
      </section>
    </main>
  );
}
