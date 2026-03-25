"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Visualizer } from "./visualizer";
import { StepInfo } from "./step-info";
import { CodeEditor } from "./code-editor";
import { algorithms, getAlgorithm } from "@/algorithms/metadata";
import { SortOperation } from "@/algorithms/types";
import { playTone, playDualTone, playCompletionSweep } from "@/audio/engine";

type PlaygroundProps = {
  initialAlgorithmSlug?: string;
};

type PlaygroundState = "idle" | "running" | "replaying" | "complete" | "error";

function generateArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1).sort(
    () => Math.random() - 0.5
  );
}

export function Playground({ initialAlgorithmSlug }: PlaygroundProps) {
  const initialAlgo = initialAlgorithmSlug
    ? getAlgorithm(initialAlgorithmSlug)
    : undefined;

  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(50);
  const [editorCode, setEditorCode] = useState<string | undefined>(
    initialAlgo?.code
  );
  const [pgState, setPgState] = useState<PlaygroundState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [operationCount, setOperationCount] = useState(0);

  // Visualizer state
  const [array, setArray] = useState<number[]>(() => generateArray(arraySize));
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [operationType, setOperationType] = useState<SortOperation["type"] | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const opsRef = useRef<SortOperation[]>([]);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const arrayRef = useRef<number[]>(array);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      clearTimeout(replayTimerRef.current);
    };
  }, []);

  const resetArray = useCallback((size?: number) => {
    const s = size ?? arraySize;
    clearTimeout(replayTimerRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    const newArr = generateArray(s);
    arrayRef.current = newArr;
    setArray(newArr);
    setActiveIndices([]);
    setSortedIndices(new Set());
    setOperationType(null);
    setPgState("idle");
    setError(null);
    setOperationCount(0);
    opsRef.current = [];
  }, [arraySize]);

  const replayOps = useCallback((ops: SortOperation[], finalArray: number[]) => {
    setPgState("replaying");
    const workingArr = [...arrayRef.current];
    let idx = 0;

    function playNext() {
      if (idx >= ops.length) {
        // Done — show sorted state
        arrayRef.current = finalArray;
        setArray([...finalArray]);
        setActiveIndices([]);
        setOperationType(null);
        setSortedIndices(new Set(finalArray.map((_, i) => i)));
        setPgState("complete");
        playCompletionSweep(finalArray.length, finalArray.length);
        return;
      }

      const op = ops[idx];
      idx++;
      setOperationCount(idx);
      setActiveIndices(op.indices);
      setOperationType(op.type);

      const maxVal = workingArr.length;

      if (op.type === "swap" && op.values) {
        // Apply swap to our working copy
        const [i, j] = op.indices;
        [workingArr[i], workingArr[j]] = [workingArr[j], workingArr[i]];
        arrayRef.current = workingArr;
        setArray([...workingArr]);
        playDualTone(workingArr[i], workingArr[j], maxVal, speedRef.current);
      } else if (op.type === "insert" && op.values) {
        workingArr[op.indices[0]] = op.values[0];
        arrayRef.current = workingArr;
        setArray([...workingArr]);
        playTone(op.values[0], maxVal, "insert", speedRef.current);
      } else if (op.type === "sorted") {
        setSortedIndices((prev) => {
          const next = new Set(prev);
          op.indices.forEach((i) => next.add(i));
          return next;
        });
        playTone(workingArr[op.indices[0]] ?? maxVal, maxVal, "sorted", speedRef.current);
      } else {
        playTone(workingArr[op.indices[0]], maxVal, "compare", speedRef.current);
      }

      replayTimerRef.current = setTimeout(playNext, speedRef.current);
    }

    playNext();
  }, []);

  const handleRun = useCallback(
    (code: string): void => {
      // Reset state
      clearTimeout(replayTimerRef.current);
      workerRef.current?.terminate();
      setError(null);
      setOperationCount(0);
      setSortedIndices(new Set());
      setPgState("running");

      const runArray = [...arrayRef.current];
      opsRef.current = [];

      const worker = new Worker(
        new URL("@/workers/sort-worker.ts", import.meta.url)
      );
      workerRef.current = worker;

      const timeout = setTimeout(() => {
        worker.terminate();
        workerRef.current = null;
        setError("Execution timed out after 30 seconds. Possible infinite loop.");
        setPgState("error");
      }, 30_000);

      worker.onmessage = (e) => {
        const data = e.data;
        if (data.type === "operation") {
          opsRef.current.push(data.op as SortOperation);
        } else if (data.type === "done") {
          clearTimeout(timeout);
          worker.terminate();
          workerRef.current = null;
          // Now replay the collected ops with animation
          replayOps(opsRef.current, data.array);
        } else if (data.type === "error") {
          clearTimeout(timeout);
          const lineInfo = data.line ? ` (line ${data.line})` : "";
          setError(`${data.message}${lineInfo}`);
          setPgState("error");
          worker.terminate();
          workerRef.current = null;
        }
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        setError(e.message || "Unknown worker error");
        setPgState("error");
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage({ type: "run", code, array: runArray, speed: 0 });
    },
    [replayOps]
  );

  const handleLoadAlgorithm = useCallback((slug: string) => {
    const algo = getAlgorithm(slug);
    if (algo) {
      setEditorCode(algo.code);
    }
  }, []);

  const handleSizeChange = useCallback((size: number) => {
    setArraySize(size);
    const newArr = generateArray(size);
    arrayRef.current = newArr;
    setArray(newArr);
    setActiveIndices([]);
    setSortedIndices(new Set());
    setOperationType(null);
    setPgState("idle");
    setOperationCount(0);
  }, []);

  const isDisabled = pgState === "running" || pgState === "replaying";

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Visualizer on top */}
      <Visualizer
        array={array}
        activeIndices={activeIndices}
        sortedIndices={sortedIndices}
        operationType={operationType}
        maxValue={arraySize}
        speed={speed}
        arraySize={arraySize}
        onSpeedChange={setSpeed}
        onSizeChange={handleSizeChange}
        sizeDisabled={isDisabled}
      />

      <StepInfo
        activeIndices={activeIndices}
        operationType={operationType}
        state={pgState === "replaying" ? "running" : pgState === "error" ? "idle" : pgState === "complete" ? "complete" : "idle"}
        algorithmName="Custom"
      />

      {/* Algorithm loader */}
      <div className="flex items-center gap-3 flex-wrap">
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
              disabled={isDisabled}
              className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded border border-border bg-surface-2 text-foreground-muted hover:text-accent hover:border-accent/30 transition-all disabled:opacity-30"
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>

      <CodeEditor
        initialCode={editorCode}
        error={error}
        transport={{
          state: pgState === "replaying" ? "running" : pgState === "error" ? "idle" : pgState,
          operationCount,
          onPlay: handleRun,
          onStop: () => resetArray(),
          playLabel: "Run",
        }}
      />
    </div>
  );
}
