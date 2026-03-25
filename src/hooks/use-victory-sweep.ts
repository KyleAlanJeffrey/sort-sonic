"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { playTone } from "@/audio/engine";

export type SweepState = "idle" | "sweeping" | "done";

export function useVictorySweep(arrayLength: number) {
  const [sweepIndex, setSweepIndex] = useState(-1);
  const [sweepState, setSweepState] = useState<SweepState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const idxRef = useRef(0);
  const lenRef = useRef(arrayLength);

  useEffect(() => {
    lenRef.current = arrayLength;
  }, [arrayLength]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const startSweep = useCallback((arr: number[]) => {
    const len = arr.length;
    idxRef.current = 0;
    setSweepState("sweeping");
    setSweepIndex(0);

    // Sweep speed: faster for larger arrays, min 10ms, max 40ms
    const sweepDelay = Math.max(10, Math.min(40, 1500 / len));

    function next() {
      const i = idxRef.current;
      if (i >= len) {
        setSweepState("done");
        return;
      }

      setSweepIndex(i);

      // Play ascending tone for each bar
      playTone(arr[i], len, "sorted", sweepDelay * 1.5);

      idxRef.current = i + 1;
      timerRef.current = setTimeout(next, sweepDelay);
    }

    next();
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setSweepIndex(-1);
    setSweepState("idle");
    idxRef.current = 0;
  }, []);

  return { sweepIndex, sweepState, startSweep, reset };
}
