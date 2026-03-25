"use client";

import { OperationType } from "@/algorithms/types";
import { EngineState } from "@/hooks/use-sort-engine";

type StepInfoProps = {
  activeIndices: number[];
  operationType: OperationType | null;
  state: EngineState;
  algorithmName: string;
};

const OP_LABELS: Record<OperationType, string> = {
  compare: "CMP",
  swap: "SWP",
  insert: "INS",
  sorted: "FIN",
};

const OP_COLORS: Record<OperationType, string> = {
  compare: "text-compare",
  swap: "text-swap",
  insert: "text-swap",
  sorted: "text-sorted",
};

export function StepInfo({
  activeIndices,
  operationType,
  state,
  algorithmName,
}: StepInfoProps) {
  if (state === "idle") {
    return (
      <div className="flex items-center gap-2 h-6 font-mono text-xs text-foreground-muted tracking-wider">
        <span className="text-accent">{">"}</span>
        <span className="cursor-blink">
          Ready — {algorithmName}
        </span>
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="flex items-center gap-2 h-6 font-mono text-xs tracking-wider">
        <span className="text-sorted">{">"}</span>
        <span className="text-sorted">SORTED</span>
      </div>
    );
  }

  if (!operationType) {
    return <div className="h-6" />;
  }

  const [i, j] = activeIndices;

  return (
    <div className="flex items-center gap-2 h-6 font-mono text-xs tracking-wider">
      <span className={OP_COLORS[operationType]}>
        {OP_LABELS[operationType]}
      </span>
      <span className="text-foreground-muted">
        [{i}{j !== undefined ? `, ${j}` : ""}]
      </span>
    </div>
  );
}
