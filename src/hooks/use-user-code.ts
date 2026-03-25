"use client";

import { useRef, useCallback, useState } from "react";
import { SortOperation } from "@/algorithms/types";

type UserCodeState = "idle" | "running" | "complete" | "error";

export function useUserCode(
  onOperation: (op: SortOperation) => void,
  onDone: (array: number[]) => void
) {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<UserCodeState>("idle");
  const [error, setError] = useState<string | null>(null);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const run = useCallback(
    (code: string, array: number[]) => {
      terminate();
      setError(null);
      setState("running");

      const worker = new Worker(
        new URL("@/workers/sort-worker.ts", import.meta.url)
      );
      workerRef.current = worker;

      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        terminate();
        setError("Execution timed out after 30 seconds. Possible infinite loop.");
        setState("error");
      }, 30_000);

      worker.onmessage = (e) => {
        const data = e.data;
        if (data.type === "operation") {
          onOperation(data.op as SortOperation);
        } else if (data.type === "done") {
          clearTimeout(timeout);
          setState("complete");
          onDone(data.array);
          terminate();
        } else if (data.type === "error") {
          clearTimeout(timeout);
          const lineInfo = data.line ? ` (line ${data.line})` : "";
          setError(`${data.message}${lineInfo}`);
          setState("error");
          terminate();
        }
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        setError(e.message || "Unknown worker error");
        setState("error");
        terminate();
      };

      worker.postMessage({ type: "run", code, array, speed: 0 });
    },
    [onOperation, onDone, terminate]
  );

  return { run, terminate, state, error };
}
