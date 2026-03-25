"use client";

import { useState, useCallback, useRef } from "react";
import { Visualizer } from "./visualizer";
import { Controls } from "./controls";
import { AlgorithmPicker } from "./algorithm-picker";
import { StepInfo } from "./step-info";
import { CodeEditor } from "./code-editor";
import { useSortEngine } from "@/hooks/use-sort-engine";
import { useUserCode } from "@/hooks/use-user-code";
import { getAlgorithm } from "@/algorithms/metadata";
import { SortOperation } from "@/algorithms/types";
import { playTone, playDualTone, playCompletionSweep } from "@/audio/engine";

type SortPlaygroundProps = {
  initialAlgorithm?: string;
};

export function SortPlayground({
  initialAlgorithm = "bubble-sort",
}: SortPlaygroundProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(initialAlgorithm);
  const [isCustomMode, setIsCustomMode] = useState(initialAlgorithm === "custom");
  const [editorCode, setEditorCode] = useState<string | undefined>(undefined);
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(50);

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

  const algorithmMeta = getAlgorithm(selectedAlgorithm);
  const algorithmName = isCustomMode
    ? "Custom"
    : algorithmMeta?.name ?? "Unknown";

  const handlePlay = useCallback(() => {
    if (isCustomMode) return;
    const algo = getAlgorithm(selectedAlgorithm);
    if (algo) {
      engine.start(algo.fn, algo.slug);
    }
  }, [selectedAlgorithm, engine, isCustomMode]);

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

  const handleAlgorithmSelect = useCallback(
    (slug: string) => {
      setSelectedAlgorithm(slug);
      setIsCustomMode(false);
      // Load the algorithm's code into the editor for reference
      const algo = getAlgorithm(slug);
      if (algo) {
        setEditorCode(algo.code);
      }
      if (engine.state !== "idle") {
        engine.reset(arraySize);
      }
    },
    [engine, arraySize]
  );

  const handleCustomSelect = useCallback(() => {
    setIsCustomMode(true);
    setSelectedAlgorithm("custom");
    // Keep whatever code is in the editor
    if (engine.state !== "idle") {
      engine.reset(arraySize);
    }
  }, [engine, arraySize]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <AlgorithmPicker
        selected={selectedAlgorithm}
        onSelect={handleAlgorithmSelect}
        disabled={engine.state === "running"}
        showCustom
        onCustomSelect={handleCustomSelect}
      />

      <Visualizer
        array={engine.array}
        activeIndices={engine.activeIndices}
        sortedIndices={engine.sortedIndices}
        operationType={engine.operationType}
        maxValue={arraySize}
      />

      <div className="flex items-center justify-between">
        <StepInfo
          activeIndices={engine.activeIndices}
          operationType={engine.operationType}
          state={engine.state}
          algorithmName={algorithmName}
        />
      </div>

      <Controls
        state={engine.state}
        operationCount={engine.operationCount}
        speed={speed}
        arraySize={arraySize}
        onPlay={isCustomMode ? () => {} : handlePlay}
        onPause={engine.pause}
        onResume={engine.resume}
        onReset={() => engine.reset(arraySize)}
        onSpeedChange={handleSpeedChange}
        onSizeChange={handleSizeChange}
        onStep={engine.step}
      />

      {/* Algorithm info + code editor side by side on larger screens */}
      {!isCustomMode && algorithmMeta && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Analysis panel */}
          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-compare shadow-[0_0_4px_var(--compare-glow)]" />
              <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
                Analysis
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono tracking-wider">
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

          {/* Code preview */}
          <CodeEditor
            onRun={handleRunCustom}
            disabled={userCode.state === "running"}
            error={userCode.error}
            initialCode={algorithmMeta.code}
          />
        </div>
      )}

      {isCustomMode && (
        <CodeEditor
          onRun={handleRunCustom}
          disabled={userCode.state === "running"}
          error={userCode.error}
          initialCode={editorCode}
        />
      )}
    </div>
  );
}
