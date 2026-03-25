"use client";

import { OperationType } from "@/algorithms/types";
import { EngineState } from "@/hooks/use-sort-engine";

type VisualizerProps = {
  array: number[];
  activeIndices: number[];
  sortedIndices: Set<number>;
  operationType: OperationType | null;
  maxValue: number;
  speed?: number;
  arraySize?: number;
  onSpeedChange?: (ms: number) => void;
  onSizeChange?: (size: number) => void;
  sizeDisabled?: boolean;
  // Status display
  state?: EngineState;
  algorithmName?: string;
  operationCount?: number;
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

  return {
    background: `linear-gradient(to top, rgba(0, 180, 150, ${0.6 + t * 0.4}), rgba(0, 255, 213, ${0.7 + t * 0.3}))`,
    boxShadow: `0 0 ${4 + t * 4}px var(--accent-dim)`,
    opacity: 0.85 + t * 0.15,
  };
}

function StatusText({
  state,
  algorithmName,
  operationType,
  activeIndices,
  operationCount,
}: {
  state: EngineState;
  algorithmName: string;
  operationType: OperationType | null;
  activeIndices: number[];
  operationCount: number;
}) {
  const opsLabel = (
    <span className="text-foreground-muted/50 tabular-nums">
      {operationCount.toLocaleString()} ops
    </span>
  );

  if (state === "idle") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-accent">{">"}</span>
        <span className="cursor-blink">Ready — {algorithmName}</span>
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sorted">SORTED</span>
        {opsLabel}
      </div>
    );
  }

  if (!operationType) {
    return <div className="flex items-center gap-3">{opsLabel}</div>;
  }

  const opLabels: Record<OperationType, string> = { compare: "CMP", swap: "SWP", insert: "INS", sorted: "FIN" };
  const opColors: Record<OperationType, string> = { compare: "text-compare", swap: "text-swap", insert: "text-swap", sorted: "text-sorted" };
  const [i, j] = activeIndices;

  return (
    <div className="flex items-center gap-2">
      <span className={opColors[operationType]}>{opLabels[operationType]}</span>
      <span className="text-foreground-muted/60">[{i}{j !== undefined ? `,${j}` : ""}]</span>
      {opsLabel}
    </div>
  );
}

export function Visualizer({
  array,
  activeIndices,
  sortedIndices,
  operationType,
  maxValue,
  speed,
  arraySize,
  onSpeedChange,
  onSizeChange,
  sizeDisabled = false,
  state,
  algorithmName,
  operationCount,
}: VisualizerProps) {
  const hasControls = onSpeedChange || onSizeChange;
  const hasStatus = state !== undefined && algorithmName !== undefined;

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        {/* Left: label + sliders */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${state === "running" ? "bg-accent shadow-[0_0_6px_var(--accent-glow)] animate-pulse" : state === "complete" ? "bg-sorted shadow-[0_0_6px_var(--sorted-glow)]" : "bg-accent shadow-[0_0_6px_var(--accent-glow)]"}`} />
            <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
              {array.length} elements
            </span>
          </div>

          {hasControls && (
            <div className="flex items-center gap-4">
              {onSpeedChange && speed !== undefined && (
                <label className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-foreground-muted/50 tracking-wider uppercase">Spd</span>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    value={201 - speed}
                    onChange={(e) => onSpeedChange(201 - Number(e.target.value))}
                    className="w-20"
                  />
                </label>
              )}
              {onSizeChange && arraySize !== undefined && (
                <label className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-foreground-muted/50 tracking-wider uppercase">Size</span>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    value={arraySize}
                    onChange={(e) => onSizeChange(Number(e.target.value))}
                    className="w-20"
                    disabled={sizeDisabled}
                  />
                  <span className="text-[10px] font-mono text-foreground-muted/40 tabular-nums w-6 text-right">{arraySize}</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Right: status + ops */}
        {hasStatus && (
          <div className="text-[10px] font-mono tracking-wider">
            <StatusText
              state={state}
              algorithmName={algorithmName}
              operationType={operationType}
              activeIndices={activeIndices}
              operationCount={operationCount ?? 0}
            />
          </div>
        )}
      </div>

      {/* Bars */}
      <div className="relative scanlines viz-grid">
        <div className="flex items-end justify-center gap-px h-90 w-full p-4 pb-3">
          {array.map((value, index) => {
            const heightPercent = (value / maxValue) * 100;
            const style = getBarStyle(value, maxValue, index, activeIndices, sortedIndices, operationType);
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
        <div className="h-px w-full bg-linear-to-r from-transparent via-accent/10 to-transparent" />
      </div>
    </div>
  );
}
