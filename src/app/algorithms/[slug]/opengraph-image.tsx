import { ImageResponse } from "next/og";
import { getAlgorithm, algorithmSlugs } from "@/algorithms/metadata";

export const size = {
  width: 1200,
  height: 630,
};

export const runtime = "edge";
export const contentType = "image/png";

export function generateStaticParams() {
  return algorithmSlugs.map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const algo = getAlgorithm(slug);
  const name = algo?.name ?? slug;
  const complexity = algo?.timeComplexity.average ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#06060a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,255,213,0.12) 0%, transparent 70%)",
            top: -80,
            left: -80,
            display: "flex",
          }}
        />
        {/* Algorithm name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#e8e6e3",
            letterSpacing: "-0.02em",
            display: "flex",
            marginBottom: 16,
          }}
        >
          {name}
        </div>
        {/* Complexity badge */}
        {complexity && (
          <div
            style={{
              fontSize: 32,
              color: "#00ffd5",
              fontFamily: "monospace",
              background: "rgba(0,255,213,0.1)",
              padding: "8px 24px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,213,0.3)",
              display: "flex",
              marginBottom: 32,
            }}
          >
            {complexity}
          </div>
        )}
        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#9b9893",
            display: "flex",
          }}
        >
          Interactive Visualizer with Sound
        </div>
        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            fontSize: 24,
            color: "#9b9893",
          }}
        >
          Sort
          <span style={{ color: "#00ffd5" }}>Sonic</span>
        </div>
        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(to right, transparent, #00ffd5, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
