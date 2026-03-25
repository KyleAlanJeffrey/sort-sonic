"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { SortOperation, SortGenerator, AlgorithmFn } from "@/algorithms/types";
import { playTone, playDualTone, playCompletionSweep } from "@/audio/engine";

export type EngineState = "idle" | "running" | "paused" | "complete";

function generateArray(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1).sort(
    () => Math.random() - 0.5
  );
}

export function useSortEngine(initialSize: number = 50) {
  const [array, setArray] = useState<number[]>(() => generateArray(initialSize));
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  const [operationType, setOperationType] = useState<SortOperation["type"] | null>(null);
  const [state, setState] = useState<EngineState>("idle");
  const [operationCount, setOperationCount] = useState(0);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<string>("bubble-sort");

  const generatorRef = useRef<SortGenerator | null>(null);
  const arrayRef = useRef<number[]>(array);
  const speedRef = useRef<number>(50);
  const stateRef = useRef<EngineState>("idle");
  const animFrameRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const maxValue = useRef<number>(initialSize);

  const updateArray = useCallback((newArr: number[]) => {
    arrayRef.current = newArr;
    setArray([...newArr]);
  }, []);

  const reset = useCallback(
    (size?: number) => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(timeoutRef.current);
      const s = size ?? arrayRef.current.length;
      const newArr = generateArray(s);
      maxValue.current = s;
      arrayRef.current = newArr;
      setArray(newArr);
      setActiveIndices([]);
      setSortedIndices(new Set());
      setOperationType(null);
      setState("idle");
      stateRef.current = "idle";
      setOperationCount(0);
      generatorRef.current = null;
    },
    []
  );

  const step = useCallback((): boolean => {
    if (!generatorRef.current) return false;
    const result = generatorRef.current.next();
    if (result.done) {
      setActiveIndices([]);
      setOperationType(null);
      setState("complete");
      stateRef.current = "complete";
      setSortedIndices(new Set(arrayRef.current.map((_, i) => i)));
      playCompletionSweep(arrayRef.current.length, maxValue.current);
      return false;
    }

    const op = result.value;
    setActiveIndices(op.indices);
    setOperationType(op.type);
    setOperationCount((c) => c + 1);

    if (op.type === "sorted") {
      setSortedIndices((prev) => {
        const next = new Set(prev);
        op.indices.forEach((i) => next.add(i));
        return next;
      });
      playTone(
        arrayRef.current[op.indices[0]] ?? maxValue.current,
        maxValue.current,
        "sorted",
        speedRef.current
      );
    } else if (op.type === "swap") {
      const arr = arrayRef.current;
      updateArray(arr);
      playDualTone(
        arr[op.indices[0]],
        arr[op.indices[1]],
        maxValue.current,
        speedRef.current
      );
    } else if (op.type === "insert") {
      updateArray(arrayRef.current);
      playTone(
        op.values?.[0] ?? arrayRef.current[op.indices[0]],
        maxValue.current,
        "insert",
        speedRef.current
      );
    } else {
      playTone(
        arrayRef.current[op.indices[0]],
        maxValue.current,
        "compare",
        speedRef.current
      );
    }

    return true;
  }, [updateArray]);

  const runLoop = useCallback(() => {
    if (stateRef.current !== "running") return;

    const hasMore = step();
    if (hasMore) {
      timeoutRef.current = setTimeout(() => {
        animFrameRef.current = requestAnimationFrame(runLoop);
      }, speedRef.current);
    }
  }, [step]);

  const start = useCallback(
    (algorithmFn: AlgorithmFn, slug: string) => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(timeoutRef.current);

      const arr = [...arrayRef.current];
      arrayRef.current = arr;
      setArray([...arr]);
      setSortedIndices(new Set());
      setOperationCount(0);
      setCurrentAlgorithm(slug);

      generatorRef.current = algorithmFn(arrayRef.current);
      setState("running");
      stateRef.current = "running";
      runLoop();
    },
    [runLoop]
  );

  const pause = useCallback(() => {
    setState("paused");
    stateRef.current = "paused";
    cancelAnimationFrame(animFrameRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  const resume = useCallback(() => {
    if (stateRef.current !== "paused") return;
    setState("running");
    stateRef.current = "running";
    runLoop();
  }, [runLoop]);

  const setSpeed = useCallback((ms: number) => {
    speedRef.current = ms;
  }, []);

  // Cleanup on unmount — stop sorting when navigating away
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(timeoutRef.current);
      stateRef.current = "idle";
      generatorRef.current = null;
    };
  }, []);

  return {
    array,
    activeIndices,
    sortedIndices,
    operationType,
    state,
    operationCount,
    currentAlgorithm,
    start,
    pause,
    resume,
    reset,
    step,
    setSpeed,
  };
}
