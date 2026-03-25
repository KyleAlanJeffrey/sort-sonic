import { algorithms } from "@/algorithms/metadata";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-24">
      {/* Hero — write your own is the star */}
      <section className="relative pt-16 pb-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-125 bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative space-y-10">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Write a sort.
              <br />
              <span className="text-accent">Hear it think.</span>
            </h1>

            <p className="text-lg text-foreground-muted max-w-xl mx-auto leading-relaxed">
              Build your own sorting algorithm in the browser and watch every
              comparison, swap, and insertion play out as synchronized sound and
              animation.
            </p>
          </div>

          {/* Two paths — playground is primary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Playground card — primary */}
            <Link
              href="/playground"
              className="group relative rounded-xl border-2 border-accent/30 bg-accent/3 p-6 transition-all duration-300 hover:border-accent/60 hover:shadow-[0_0_30px_var(--accent-dim)] animate-fade-up"
            >
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)] animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-accent tracking-widest uppercase">
                  Playground
                </div>
                <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                  Write your own algorithm
                </h2>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  Use{" "}
                  <code className="text-accent text-xs font-mono">compare()</code>,{" "}
                  <code className="text-accent text-xs font-mono">swap()</code>,
                  and more. Your code runs in a sandbox with real-time
                  visualization and audio feedback.
                </p>
                <div className="pt-2 text-xs font-mono text-accent tracking-widest uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Open playground <span>{"→"}</span>
                </div>
              </div>
            </Link>

            {/* Algorithms card — secondary */}
            <Link
              href="/algorithms/bubble-sort"
              className="group relative rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:border-border-bright hover:bg-surface-2 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
                  Showcase
                </div>
                <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                  Explore classic algorithms
                </h2>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  Watch Bubble Sort, Merge Sort, Quick Sort, and more execute
                  step by step with sound. See complexity analysis, pseudocode,
                  and explanations.
                </p>
                <div className="pt-2 text-xs font-mono text-foreground-muted tracking-widest uppercase flex items-center gap-1.5 group-hover:gap-2.5 group-hover:text-accent transition-all">
                  Browse algorithms <span>{"→"}</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Algorithm grid — compact showcase */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-compare shadow-[0_0_4px_var(--compare-glow)]" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-foreground-muted">
            6 algorithms, visualized
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {algorithms.map((algo, i) => (
            <Link
              key={algo.slug}
              href={`/algorithms/${algo.slug}`}
              className="group bg-surface hover:bg-surface-2 border border-border hover:border-border-bright rounded-lg p-3 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                {algo.name}
              </h3>
              <div className="text-[10px] font-mono text-foreground-muted/50 mt-1">
                {algo.timeComplexity.average}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
