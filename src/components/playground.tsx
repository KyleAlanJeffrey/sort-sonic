"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Visualizer } from "./visualizer";
import { PlaygroundEditor } from "./code-editor";
import { getAlgorithm } from "@/algorithms/metadata";
import { SortOperation } from "@/algorithms/types";
import { playTone, playDualTone } from "@/audio/engine";
import { useVictorySweep } from "@/hooks/use-victory-sweep";

type PlaygroundProps = {
  initialAlgorithmSlug?: string;
};

type PgState = "idle" | "running" | "replaying" | "paused" | "complete" | "error";

function generateArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
}

export function Playground({ initialAlgorithmSlug }: PlaygroundProps) {
  const initialAlgo = initialAlgorithmSlug ? getAlgorithm(initialAlgorithmSlug) : undefined;

  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(50);
  const [editorCode, setEditorCode] = useState<string | undefined>(initialAlgo?.code);
  const [pgState, setPgState] = useState<PgState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [operationCount, setOperationCount] = useState(0);

  const [array, setArray] = useState<number[]>(() => generateArray(arraySize));
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [operationType, setOperationType] = useState<SortOperation["type"] | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const opsRef = useRef<SortOperation[]>([]);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const arrayRef = useRef<number[]>(array);
  const speedRef = useRef(speed);
  // Replay state stored in refs so playNext can access latest
  const replayIdxRef = useRef(0);
  const replayOpsRef = useRef<SortOperation[]>([]);
  const replayFinalRef = useRef<number[]>([]);
  const replayWorkingRef = useRef<number[]>([]);
  const pgStateRef = useRef<PgState>("idle");

  const sweep = useVictorySweep(arraySize);
  const prevPgState = useRef<PgState>("idle");

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pgStateRef.current = pgState; }, [pgState]);
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      clearTimeout(replayTimerRef.current);
    };
  }, []);

  // Trigger victory sweep on completion
  useEffect(() => {
    if (prevPgState.current !== "complete" && pgState === "complete") {
      sweep.startSweep(arrayRef.current);
    }
    prevPgState.current = pgState;
  }, [pgState, sweep]);

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
    pgStateRef.current = "idle";
    setError(null);
    setOperationCount(0);
    opsRef.current = [];
    sweep.reset();
  }, [arraySize, sweep]);

  const playNextOp = useCallback(() => {
    if (pgStateRef.current !== "replaying") return;

    const ops = replayOpsRef.current;
    const finalArray = replayFinalRef.current;
    const workingArr = replayWorkingRef.current;
    const idx = replayIdxRef.current;

    if (idx >= ops.length) {
      arrayRef.current = finalArray;
      setArray([...finalArray]);
      setActiveIndices([]);
      setOperationType(null);
      setSortedIndices(new Set(finalArray.map((_, i) => i)));
      setPgState("complete");
      pgStateRef.current = "complete";
      // Victory sweep triggered by effect
      return;
    }

    const op = ops[idx];
    replayIdxRef.current = idx + 1;
    setOperationCount(idx + 1);
    setActiveIndices(op.indices);
    setOperationType(op.type);
    const maxVal = workingArr.length;

    if (op.type === "swap" && op.values) {
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

    replayTimerRef.current = setTimeout(playNextOp, speedRef.current);
  }, []);

  const startReplay = useCallback((ops: SortOperation[], finalArray: number[]) => {
    replayOpsRef.current = ops;
    replayFinalRef.current = finalArray;
    replayWorkingRef.current = [...arrayRef.current];
    replayIdxRef.current = 0;
    setPgState("replaying");
    pgStateRef.current = "replaying";
    playNextOp();
  }, [playNextOp]);

  const handlePause = useCallback(() => {
    clearTimeout(replayTimerRef.current);
    setPgState("paused");
    pgStateRef.current = "paused";
  }, []);

  const handleResume = useCallback(() => {
    setPgState("replaying");
    pgStateRef.current = "replaying";
    playNextOp();
  }, [playNextOp]);

  const handleStep = useCallback(() => {
    // Play one op while staying paused
    const ops = replayOpsRef.current;
    const finalArray = replayFinalRef.current;
    const workingArr = replayWorkingRef.current;
    const idx = replayIdxRef.current;

    if (idx >= ops.length) {
      arrayRef.current = finalArray;
      setArray([...finalArray]);
      setActiveIndices([]);
      setOperationType(null);
      setSortedIndices(new Set(finalArray.map((_, i) => i)));
      setPgState("complete");
      pgStateRef.current = "complete";
      // Victory sweep triggered by effect
      return;
    }

    const op = ops[idx];
    replayIdxRef.current = idx + 1;
    setOperationCount(idx + 1);
    setActiveIndices(op.indices);
    setOperationType(op.type);
    const maxVal = workingArr.length;

    if (op.type === "swap" && op.values) {
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
  }, []);

  const handleRun = useCallback(
    (code: string): void => {
      clearTimeout(replayTimerRef.current);
      workerRef.current?.terminate();
      setError(null);
      setOperationCount(0);
      setSortedIndices(new Set());
      setPgState("running");
      pgStateRef.current = "running";

      const runArray = [...arrayRef.current];
      opsRef.current = [];

      const worker = new Worker(new URL("@/workers/sort-worker.ts", import.meta.url));
      workerRef.current = worker;

      const timeout = setTimeout(() => {
        worker.terminate();
        workerRef.current = null;
        setError("Execution timed out after 30 seconds. Possible infinite loop.");
        setPgState("error");
        pgStateRef.current = "error";
      }, 30_000);

      worker.onmessage = (e) => {
        const data = e.data;
        if (data.type === "operation") {
          opsRef.current.push(data.op as SortOperation);
        } else if (data.type === "done") {
          clearTimeout(timeout);
          worker.terminate();
          workerRef.current = null;
          startReplay(opsRef.current, data.array);
        } else if (data.type === "error") {
          clearTimeout(timeout);
          const lineInfo = data.line ? ` (line ${data.line})` : "";
          setError(`${data.message}${lineInfo}`);
          setPgState("error");
          pgStateRef.current = "error";
          worker.terminate();
          workerRef.current = null;
        }
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        setError(e.message || "Unknown worker error");
        setPgState("error");
        pgStateRef.current = "error";
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage({ type: "run", code, array: runArray, speed: 0 });
    },
    [startReplay]
  );

  const handleSizeChange = useCallback((size: number) => {
    setArraySize(size);
    const newArr = generateArray(size);
    arrayRef.current = newArr;
    setArray(newArr);
    setActiveIndices([]);
    setSortedIndices(new Set());
    setOperationType(null);
    setPgState("idle");
    pgStateRef.current = "idle";
    setOperationCount(0);
  }, []);

  // Map internal state to editor transport state
  const editorState = pgState === "replaying" ? "running" as const
    : pgState === "running" ? "running" as const
    : pgState === "paused" ? "paused" as const
    : pgState === "complete" ? "complete" as const
    : "idle" as const;

  const vizState = pgState === "replaying" ? "running" as const
    : pgState === "paused" ? "paused" as const
    : pgState === "complete" ? "complete" as const
    : "idle" as const;

  const isActive = pgState === "running" || pgState === "replaying" || pgState === "paused";

  return (
    <div className="flex flex-col gap-5 w-full">
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
        sizeDisabled={isActive || pgState === "complete"}
        state={vizState}
        algorithmName="Custom"
        operationCount={operationCount}
        sweepIndex={sweep.sweepIndex}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <PlaygroundEditor
          initialCode={editorCode}
          error={error}
          state={editorState}
          operationCount={operationCount}
          onRun={handleRun}
          onPause={handlePause}
          onResume={handleResume}
          onStep={handleStep}
          onStop={() => resetArray()}
        />

        {/* API Reference */}
        <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-4 h-fit">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_4px_var(--accent-glow)]" />
            <span className="text-[10px] font-mono text-foreground-muted tracking-widest uppercase">
              API Reference
            </span>
          </div>

          <div className="flex flex-col gap-3 text-[12px] font-mono">
            <div>
              <div className="text-accent">compare(i, j)</div>
              <div className="text-foreground-muted/70 text-[11px] mt-0.5">
                Returns <span className="text-keyword">true</span> if arr[i] {">"} arr[j]
              </div>
            </div>
            <div>
              <div className="text-accent">swap(i, j)</div>
              <div className="text-foreground-muted/70 text-[11px] mt-0.5">
                Swaps elements at indices i and j
              </div>
            </div>
            <div>
              <div className="text-accent">length</div>
              <div className="text-foreground-muted/70 text-[11px] mt-0.5">
                The array length
              </div>
            </div>
            <div>
              <div className="text-accent">get(i)</div>
              <div className="text-foreground-muted/70 text-[11px] mt-0.5">
                Get value at index i
              </div>
            </div>
            <div>
              <div className="text-accent">set(i, value)</div>
              <div className="text-foreground-muted/70 text-[11px] mt-0.5">
                Set value at index i
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-3 text-[11px] text-foreground-muted/50 leading-relaxed">
            Each <span className="text-accent/70">compare</span> and <span className="text-accent/70">swap</span> call triggers a visual update and audio tone.
          </div>
        </div>
      </div>
    </div>
  );
}
