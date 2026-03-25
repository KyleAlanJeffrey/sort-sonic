"use client";

import { EngineState } from "@/hooks/use-sort-engine";

type ControlsProps = {
  state: EngineState;
  operationCount: number;
  speed: number;
  arraySize: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
  onSizeChange: (size: number) => void;
  onStep: () => void;
};

function HardwareButton({
  onClick,
  children,
  variant = "default",
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "accent" | "default";
  disabled?: boolean;
}) {
  const base =
    "relative px-5 py-2.5 text-xs font-mono uppercase tracking-widest rounded-md transition-all duration-150 border";
  const variants = {
    accent:
      "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_16px_var(--accent-glow)]",
    default:
      "bg-surface-2 text-foreground-muted border-border-bright hover:bg-surface-3 hover:text-foreground hover:border-border-bright",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none`}
    >
      {children}
    </button>
  );
}

export function Controls({
  state,
  operationCount,
  speed,
  arraySize,
  onPlay,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
  onSizeChange,
  onStep,
}: ControlsProps) {
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isIdle = state === "idle";
  const isComplete = state === "complete";

  return (
    <div className="flex flex-col gap-5 bg-surface rounded-xl border border-border p-4">
      {/* Transport controls row */}
      <div className="flex items-center gap-3">
        {isIdle && (
          <HardwareButton onClick={onPlay} variant="accent">
            Sort
          </HardwareButton>
        )}
        {isRunning && (
          <HardwareButton onClick={onPause}>
            Pause
          </HardwareButton>
        )}
        {isPaused && (
          <>
            <HardwareButton onClick={onResume} variant="accent">
              Resume
            </HardwareButton>
            <HardwareButton onClick={onStep}>
              Step
            </HardwareButton>
          </>
        )}
        {(isPaused || isComplete) && (
          <HardwareButton onClick={onReset}>
            Reset
          </HardwareButton>
        )}

        {/* Op counter */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-accent shadow-[0_0_6px_var(--accent-glow)] animate-pulse" : isComplete ? "bg-sorted" : "bg-foreground-muted/30"}`} />
          <span className="text-xs font-mono text-foreground-muted tabular-nums tracking-wider">
            {operationCount.toLocaleString()} ops
          </span>
        </div>
      </div>

      {/* Faders row */}
      <div className="flex items-center gap-8">
        <label className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase w-10">
            Speed
          </span>
          <input
            type="range"
            min={1}
            max={200}
            value={201 - speed}
            onChange={(e) => onSpeedChange(201 - Number(e.target.value))}
            className="w-28"
            disabled={isRunning}
          />
        </label>

        <label className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase w-10">
            Size
          </span>
          <input
            type="range"
            min={10}
            max={200}
            value={arraySize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="w-28"
            disabled={!isIdle}
          />
          <span className="text-xs font-mono text-foreground-muted tabular-nums w-8 text-right">
            {arraySize}
          </span>
        </label>
      </div>
    </div>
  );
}
