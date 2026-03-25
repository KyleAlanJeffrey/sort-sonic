import { SortGenerator } from "./types";

export function* selectionSort(arr: number[]): SortGenerator {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: "compare", indices: [minIdx, j] };
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      yield { type: "swap", indices: [i, minIdx], values: [arr[i], arr[minIdx]] };
    }
    yield { type: "sorted", indices: [i] };
  }
  yield { type: "sorted", indices: [n - 1] };
}
