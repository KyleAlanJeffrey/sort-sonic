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
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,255,213,0.15) 0%, transparent 70%)",
            top: -100,
            right: -100,
            display: "flex",
          }}
        />
        {/* Bar visualization */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            marginBottom: 48,
          }}
        >
          {[40, 70, 25, 90, 55, 80, 35, 95, 60, 45, 85, 30, 75, 50, 65].map(
            (h, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: h * 2.2,
                  borderRadius: 4,
                  background:
                    i === 7
                      ? "#fbbf24"
                      : i === 12
                        ? "#f43f5e"
                        : `rgba(0,255,213,${0.5 + (h / 95) * 0.5})`,
                  display: "flex",
                }}
              />
            ),
          )}
        </div>
        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#e8e6e3",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Sort
            <span style={{ color: "#00ffd5" }}>Sonic</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#9b9893",
              display: "flex",
            }}
          >
            See and Hear Sorting Algorithms
          </div>
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
