import { SortGenerator } from "./types";

export function* insertionSort(arr: number[]): SortGenerator {
  const n = arr.length;
  yield { type: "sorted", indices: [0] };
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    yield { type: "compare", indices: [i, j] };
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      yield { type: "swap", indices: [j, j + 1], values: [arr[j], arr[j + 1]] };
      j--;
      if (j >= 0) {
        yield { type: "compare", indices: [j, j + 1] };
      }
    }
    arr[j + 1] = key;
    yield { type: "sorted", indices: [i] };
  }
}
