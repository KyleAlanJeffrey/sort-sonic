"use client";

import { useState, useCallback } from "react";
import { Visualizer } from "./visualizer";
import { Controls } from "./controls";
import { StepInfo } from "./step-info";
import { useSortEngine } from "@/hooks/use-sort-engine";
import { getAlgorithm } from "@/algorithms/metadata";
import Link from "next/link";

type AlgorithmVisualizerProps = {
  slug: string;
};

export function AlgorithmVisualizer({ slug }: AlgorithmVisualizerProps) {
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(50);

  const engine = useSortEngine(arraySize);
  const algorithmMeta = getAlgorithm(slug);

  const handlePlay = useCallback(() => {
    const algo = getAlgorithm(slug);
    if (algo) {
      engine.start(algo.fn, algo.slug);
    }
  }, [slug, engine]);

  const handleSpeedChange = useCallback(
    (ms: number) => {
      setSpeed(ms);
      engine.setSpeed(ms);
    },
    [engine]
  );

  const handleSizeChange = useCallback(
    (size: number) => {
      setArraySize(size);
      engine.reset(size);
    },
    [engine]
  );

  if (!algorithmMeta) return null;

  return (
    <div className="flex flex-col gap-5 w-full">
      <Visualizer
        array={engine.array}
        activeIndices={engine.activeIndices}
        sortedIndices={engine.sortedIndices}
        operationType={engine.operationType}
        maxValue={arraySize}
      />

      <StepInfo
        activeIndices={engine.activeIndices}
        operationType={engine.operationType}
        state={engine.state}
        algorithmName={algorithmMeta.name}
      />

      <Controls
        state={engine.state}
        operationCount={engine.operationCount}
        speed={speed}
        arraySize={arraySize}
        onPlay={handlePlay}
        onPause={engine.pause}
        onResume={engine.resume}
        onReset={() => engine.reset(arraySize)}
        onSpeedChange={handleSpeedChange}
        onSizeChange={handleSizeChange}
        onStep={engine.step}
      />

      {/* Analysis panel */}
      <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-compare shadow-[0_0_4px_var(--compare-glow)]" />
          <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
            Analysis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-[11px] font-mono tracking-wider">
          <div>
            <span className="text-foreground-muted/60">BEST </span>
            <span className="text-accent font-medium">{algorithmMeta.timeComplexity.best}</span>
          </div>
          <div>
            <span className="text-foreground-muted/60">AVG </span>
            <span className="text-compare font-medium">{algorithmMeta.timeComplexity.average}</span>
          </div>
          <div>
            <span className="text-foreground-muted/60">WORST </span>
            <span className="text-swap font-medium">{algorithmMeta.timeComplexity.worst}</span>
          </div>
          <div>
            <span className="text-foreground-muted/60">SPACE </span>
            <span className="text-foreground font-medium">{algorithmMeta.spaceComplexity}</span>
          </div>
        </div>

        <div className="mt-1">
          <span className={`text-[10px] font-mono tracking-widest px-2 py-0.5 rounded border ${algorithmMeta.stable ? "text-sorted border-sorted/30 bg-sorted/5" : "text-foreground-muted border-border bg-surface-2"}`}>
            {algorithmMeta.stable ? "STABLE" : "UNSTABLE"}
          </span>
        </div>

        <p className="text-[13px] text-foreground/80 leading-relaxed mt-1">
          {algorithmMeta.explanation}
        </p>
      </div>

      {/* Link to playground with this algorithm's code */}
      <Link
        href={`/playground?algorithm=${slug}`}
        className="self-start flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
      >
        <span>View code in playground</span>
        <span className="text-accent">{"→"}</span>
      </Link>
    </div>
  );
}
