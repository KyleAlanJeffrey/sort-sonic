"use client";

import { useState, useCallback, useRef } from "react";
import { Visualizer } from "./visualizer";
import { Controls } from "./controls";
import { StepInfo } from "./step-info";
import { CodeEditor } from "./code-editor";
import { useSortEngine } from "@/hooks/use-sort-engine";
import { useUserCode } from "@/hooks/use-user-code";
import { algorithms, getAlgorithm } from "@/algorithms/metadata";
import { SortOperation } from "@/algorithms/types";
import { playTone, playDualTone, playCompletionSweep } from "@/audio/engine";

type PlaygroundProps = {
  initialAlgorithmSlug?: string;
};

export function Playground({ initialAlgorithmSlug }: PlaygroundProps) {
  const initialAlgo = initialAlgorithmSlug
    ? getAlgorithm(initialAlgorithmSlug)
    : undefined;

  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(50);
  const [editorCode, setEditorCode] = useState<string | undefined>(
    initialAlgo?.code
  );

  const engine = useSortEngine(arraySize);

  const opsQueueRef = useRef<SortOperation[]>([]);
  const replayingRef = useRef(false);

  const replayOps = useCallback(() => {
    if (replayingRef.current) return;
    replayingRef.current = true;

    const maxValue = arraySize;
    let idx = 0;

    function playNext() {
      if (idx >= opsQueueRef.current.length) {
        replayingRef.current = false;
        engine.reset(arraySize);
        playCompletionSweep(arraySize, maxValue);
        return;
      }

      const op = opsQueueRef.current[idx];
      idx++;

      if (op.type === "compare") {
        playTone(op.indices[0], maxValue, "compare", speed);
      } else if (op.type === "swap") {
        playDualTone(op.indices[0], op.indices[1], maxValue, speed);
      }

      setTimeout(playNext, Math.max(speed, 5));
    }

    playNext();
  }, [arraySize, speed, engine]);

  const handleUserOperation = useCallback((op: SortOperation) => {
    opsQueueRef.current.push(op);
  }, []);

  const handleUserDone = useCallback(
    (_array: number[]) => {
      replayOps();
    },
    [replayOps]
  );

  const userCode = useUserCode(handleUserOperation, handleUserDone);

  const handleRunCustom = useCallback(
    (code: string) => {
      opsQueueRef.current = [];
      userCode.run(code, [...engine.array]);
    },
    [userCode, engine.array]
  );

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

  const handleLoadAlgorithm = useCallback((slug: string) => {
    const algo = getAlgorithm(slug);
    if (algo) {
      setEditorCode(algo.code);
    }
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Editor first — this is the star of the playground */}
      <div className="flex flex-col gap-3">
        {/* Algorithm loader */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_var(--accent-glow)]" />
            <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
              Load example
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {algorithms.map((algo) => (
              <button
                key={algo.slug}
                onClick={() => handleLoadAlgorithm(algo.slug)}
                className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded border border-border bg-surface-2 text-foreground-muted hover:text-accent hover:border-accent/30 transition-all"
              >
                {algo.name}
              </button>
            ))}
          </div>
        </div>

        <CodeEditor
          onRun={handleRunCustom}
          disabled={userCode.state === "running"}
          error={userCode.error}
          initialCode={editorCode}
        />
      </div>

      {/* Visualizer below */}
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
        algorithmName="Custom"
      />

      <Controls
        state={engine.state}
        operationCount={engine.operationCount}
        speed={speed}
        arraySize={arraySize}
        onPlay={() => {}}
        onPause={engine.pause}
        onResume={engine.resume}
        onReset={() => engine.reset(arraySize)}
        onSpeedChange={handleSpeedChange}
        onSizeChange={handleSizeChange}
        onStep={engine.step}
      />
    </div>
  );
}
