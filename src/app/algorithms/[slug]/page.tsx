import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlgorithm, algorithmSlugs, algorithms } from "@/algorithms/metadata";
import { AlgorithmVisualizer } from "@/components/algorithm-visualizer";
import Link from "next/link";

export function generateStaticParams() {
  return algorithmSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const algo = getAlgorithm(slug);
  if (!algo) return {};

  return {
    title: `${algo.name} Visualizer`,
    description: `Interactive ${algo.name} visualization with sound. ${algo.description} Time complexity: ${algo.timeComplexity.average}. ${algo.stable ? "Stable" : "Unstable"} sort.`,
    openGraph: {
      title: `${algo.name} Visualizer — SortSonic`,
      description: `Watch and hear ${algo.name} in action. ${algo.description}`,
    },
  };
}

export default async function AlgorithmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const algo = getAlgorithm(slug);
  if (!algo) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How ${algo.name} Works`,
    description: algo.explanation,
    step: [
      {
        "@type": "HowToStep",
        text: algo.explanation,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{algo.name}</h1>
          <p className="text-foreground-muted mt-1">{algo.description}</p>
        </div>
      </div>

      {/* Algorithm nav tabs */}
      <div className="flex flex-wrap gap-1.5">
        {algorithms.map((a) => (
          <Link
            key={a.slug}
            href={`/algorithms/${a.slug}`}
            className={`
              px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider
              rounded-md border transition-all duration-200
              ${
                a.slug === slug
                  ? "bg-accent/10 text-accent border-accent/40"
                  : "bg-surface-2 text-foreground-muted border-border hover:text-foreground hover:border-border-bright"
              }
            `}
          >
            {a.name}
          </Link>
        ))}
      </div>

      <AlgorithmVisualizer slug={slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
