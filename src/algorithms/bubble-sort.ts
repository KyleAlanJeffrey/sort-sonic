import { SortGenerator } from "./types";

export function* bubbleSort(arr: number[]): SortGenerator {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: "compare", indices: [j, j + 1] };
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        yield { type: "swap", indices: [j, j + 1], values: [arr[j], arr[j + 1]] };
        swapped = true;
      }
    }
    yield { type: "sorted", indices: [n - i - 1] };
    if (!swapped) {
      for (let k = 0; k < n - i - 1; k++) {
        yield { type: "sorted", indices: [k] };
      }
      break;
    }
  }
}
