"use client";

import { OperationType } from "@/algorithms/types";

type VisualizerProps = {
  array: number[];
  activeIndices: number[];
  sortedIndices: Set<number>;
  operationType: OperationType | null;
  maxValue: number;
};

function getBarStyle(
  value: number,
  maxValue: number,
  index: number,
  activeIndices: number[],
  sortedIndices: Set<number>,
  operationType: OperationType | null
): { background: string; boxShadow: string; opacity: number } {
  const t = value / maxValue;

  if (sortedIndices.has(index)) {
    return {
      background: `linear-gradient(to top, #059669, #34d399)`,
      boxShadow: `0 0 8px var(--sorted-glow), inset 0 0 6px rgba(52, 211, 153, 0.15)`,
      opacity: 1,
    };
  }

  if (activeIndices.includes(index)) {
    if (operationType === "compare") {
      return {
        background: `linear-gradient(to top, #d97706, #fbbf24)`,
        boxShadow: `0 0 12px var(--compare-glow), 0 0 24px var(--compare-glow)`,
        opacity: 1,
      };
    }
    if (operationType === "swap" || operationType === "insert") {
      return {
        background: `linear-gradient(to top, #be123c, #f43f5e)`,
        boxShadow: `0 0 12px var(--swap-glow), 0 0 24px var(--swap-glow)`,
        opacity: 1,
      };
    }
  }

  // Default: cyan gradient with brightness tied to value
  return {
    background: `linear-gradient(to top, rgba(0, 180, 150, ${0.6 + t * 0.4}), rgba(0, 255, 213, ${0.7 + t * 0.3}))`,
    boxShadow: `0 0 ${4 + t * 4}px var(--accent-dim)`,
    opacity: 0.85 + t * 0.15,
  };
}

export function Visualizer({
  array,
  activeIndices,
  sortedIndices,
  operationType,
  maxValue,
}: VisualizerProps) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
      {/* Top label bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent-glow)]" />
          <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
            Output
          </span>
        </div>
        <span className="text-[10px] font-mono text-foreground-muted/50">
          {array.length} elements
        </span>
      </div>

      {/* Visualizer area */}
      <div className="relative scanlines viz-grid">
        <div className="flex items-end justify-center gap-px h-90 w-full p-4 pb-3">
          {array.map((value, index) => {
            const heightPercent = (value / maxValue) * 100;
            const style = getBarStyle(
              value,
              maxValue,
              index,
              activeIndices,
              sortedIndices,
              operationType
            );
            return (
              <div
                key={index}
                className="flex-1 min-w-0.5 rounded-t-[1px] transition-[height] duration-75"
                style={{
                  height: `${heightPercent}%`,
                  background: style.background,
                  boxShadow: style.boxShadow,
                  opacity: style.opacity,
                }}
              />
            );
          })}
        </div>

        {/* Bottom reflection */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-accent/10 to-transparent" />
      </div>
    </div>
  );
}
