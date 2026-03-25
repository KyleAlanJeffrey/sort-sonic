import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
            bottom: -100,
            right: -100,
            display: "flex",
          }}
        />
        {/* Code brackets icon */}
        <div
          style={{
            fontSize: 48,
            color: "#00ffd5",
            fontFamily: "monospace",
            marginBottom: 24,
            display: "flex",
            opacity: 0.6,
          }}
        >
          {"{ }"}
        </div>
        {/* Title */}
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
          Playground
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#9b9893",
            display: "flex",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Write your own sorting algorithm and visualize it with sound
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
