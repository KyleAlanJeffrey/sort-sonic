import { SortGenerator, SortOperation } from "./types";

export function* quickSort(arr: number[]): SortGenerator {
  yield* quickSortHelper(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    yield { type: "sorted", indices: [i] };
  }
}

function* quickSortHelper(
  arr: number[],
  low: number,
  high: number
): Generator<SortOperation, void, undefined> {
  if (low >= high) return;

  const pivotIdx = yield* partition(arr, low, high);
  yield { type: "sorted", indices: [pivotIdx] };
  yield* quickSortHelper(arr, low, pivotIdx - 1);
  yield* quickSortHelper(arr, pivotIdx + 1, high);
}

function* partition(
  arr: number[],
  low: number,
  high: number
): Generator<SortOperation, number, undefined> {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    yield { type: "compare", indices: [j, high] };
    if (arr[j] < pivot) {
      i++;
      if (i !== j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        yield { type: "swap", indices: [i, j], values: [arr[i], arr[j]] };
      }
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  yield { type: "swap", indices: [i + 1, high], values: [arr[i + 1], arr[high]] };

  return i + 1;
}
