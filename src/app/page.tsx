import { algorithms } from "@/algorithms/metadata";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-20">
      {/* Hero */}
      <section className="relative pt-16 pb-8">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-[11px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)] animate-pulse" />
            Interactive Algorithm Visualizer
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            See and hear
            <br />
            <span className="text-accent">sorting algorithms</span>
          </h1>

          <p className="text-lg text-foreground-muted max-w-xl mx-auto leading-relaxed">
            Every comparison, swap, and insertion is mapped to a tone — so you
            don&apos;t just see the algorithm work, you hear it think.
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/algorithms/bubble-sort"
              className="relative px-6 py-3 text-xs font-mono uppercase tracking-widest rounded-lg border transition-all duration-200 bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_20px_var(--accent-glow)]"
            >
              Start visualizing
            </Link>
            <Link
              href="/playground"
              className="relative px-6 py-3 text-xs font-mono uppercase tracking-widest rounded-lg border transition-all duration-200 bg-surface-2 text-foreground-muted border-border-bright hover:bg-surface-3 hover:text-foreground"
            >
              Write your own
            </Link>
          </div>
        </div>
      </section>

      {/* Algorithm grid */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent-glow)]" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-foreground-muted">
            Algorithms
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {algorithms.map((algo, i) => (
            <Link
              key={algo.slug}
              href={`/algorithms/${algo.slug}`}
              className="group relative bg-surface hover:bg-surface-2 border border-border hover:border-border-bright rounded-xl p-5 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-accent/0 group-hover:bg-accent/2 transition-colors duration-300" />

              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                    {algo.name}
                  </h3>
                  <span className="text-[10px] font-mono text-foreground-muted/40 group-hover:text-accent/40 transition-colors">
                    {algo.stable ? "STABLE" : "UNSTABLE"}
                  </span>
                </div>

                <p className="text-sm text-foreground-muted leading-relaxed">
                  {algo.description}
                </p>

                <div className="flex gap-4 pt-1 text-[10px] font-mono tracking-wider text-foreground-muted/50">
                  <span>
                    AVG <span className="text-compare/70">{algo.timeComplexity.average}</span>
                  </span>
                  <span>
                    SPACE <span className="text-foreground-muted/80">{algo.spaceComplexity}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Playground CTA */}
      <section className="relative">
        <div className="relative rounded-xl border border-border bg-surface p-10 text-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 viz-grid opacity-50" />

          <div className="relative space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Write your own algorithm
            </h2>
            <p className="text-foreground-muted max-w-md mx-auto">
              Use <code className="text-accent font-mono text-sm">compare()</code> and{" "}
              <code className="text-accent font-mono text-sm">swap()</code> to
              build a custom sort and watch it come to life.
            </p>
            <Link
              href="/playground"
              className="inline-block mt-2 relative px-6 py-3 text-xs font-mono uppercase tracking-widest rounded-lg border transition-all duration-200 bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_20px_var(--accent-glow)]"
            >
              Open playground
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
