import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlgorithm, algorithmSlugs } from "@/algorithms/metadata";
import { SortPlayground } from "@/components/sort-playground";

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{algo.name}</h1>
        <p className="text-zinc-400 mt-1">{algo.description}</p>
      </div>

      <SortPlayground initialAlgorithm={slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
