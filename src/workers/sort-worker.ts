// Web Worker for running user-written sorting code in a sandbox.
// Communicates with main thread via postMessage.

type WorkerMessage = {
  type: "run";
  code: string;
  array: number[];
  speed: number;
};

type WorkerResponse =
  | { type: "operation"; op: { type: string; indices: number[]; values?: number[] } }
  | { type: "done"; array: number[] }
  | { type: "error"; message: string; line?: number; column?: number };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type !== "run") return;

  const { code, array } = e.data;
  const arr = [...array];
  let opCount = 0;
  const MAX_OPS = 1_000_000;

  function emitOp(op: { type: string; indices: number[]; values?: number[] }) {
    opCount++;
    if (opCount > MAX_OPS) {
      throw new Error(`Exceeded maximum operations (${MAX_OPS}). Possible infinite loop.`);
    }
    (self as unknown as Worker).postMessage({ type: "operation", op } satisfies WorkerResponse);
  }

  // Helpers injected into user code scope
  const compare = (i: number, j: number): boolean => {
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
      throw new Error(`Index out of bounds: compare(${i}, ${j}) with array length ${arr.length}`);
    }
    emitOp({ type: "compare", indices: [i, j] });
    return arr[i] > arr[j];
  };

  const swap = (i: number, j: number): void => {
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
      throw new Error(`Index out of bounds: swap(${i}, ${j}) with array length ${arr.length}`);
    }
    [arr[i], arr[j]] = [arr[j], arr[i]];
    emitOp({ type: "swap", indices: [i, j], values: [arr[i], arr[j]] });
  };

  const length = arr.length;

  const get = (i: number): number => {
    if (i < 0 || i >= arr.length) {
      throw new Error(`Index out of bounds: get(${i}) with array length ${arr.length}`);
    }
    return arr[i];
  };

  const set = (i: number, value: number): void => {
    if (i < 0 || i >= arr.length) {
      throw new Error(`Index out of bounds: set(${i}) with array length ${arr.length}`);
    }
    arr[i] = value;
    emitOp({ type: "insert", indices: [i], values: [value] });
  };

  try {
    // Wrap user code in a function that has access to helpers
    const fn = new Function("compare", "swap", "length", "get", "set", code);
    fn(compare, swap, length, get, set);

    (self as unknown as Worker).postMessage({
      type: "done",
      array: arr,
    } satisfies WorkerResponse);
  } catch (err) {
    const error = err as Error;
    let line: number | undefined;
    let column: number | undefined;

    // Try to extract line number from stack
    const match = error.stack?.match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
      line = parseInt(match[1], 10) - 2; // offset for wrapper
      column = parseInt(match[2], 10);
    }

    (self as unknown as Worker).postMessage({
      type: "error",
      message: error.message,
      line,
      column,
    } satisfies WorkerResponse);
  }
};
