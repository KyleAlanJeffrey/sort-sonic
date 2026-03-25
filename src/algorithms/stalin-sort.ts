import { SortGenerator } from "./types";

export function* stalinSort(arr: number[]): SortGenerator {
  // Any element that is out of order is simply eliminated.
  // The remaining elements are sorted. Problem solved.

  yield { type: "sorted", indices: [0] };
  let writeIdx = 1;

  for (let i = 1; i < arr.length; i++) {
    yield { type: "compare", indices: [writeIdx - 1, i] };

    if (arr[i] >= arr[writeIdx - 1]) {
      // Element is in order — it survives
      if (writeIdx !== i) {
        arr[writeIdx] = arr[i];
        yield { type: "insert", indices: [writeIdx], values: [arr[writeIdx]] };
      }
      yield { type: "sorted", indices: [writeIdx] };
      writeIdx++;
    } else {
      // Element is out of order — eliminated
      yield { type: "swap", indices: [i, i], values: [arr[i], arr[i]] };
    }
  }

  // Fill remaining spots with 0 (they've been purged)
  for (let i = writeIdx; i < arr.length; i++) {
    arr[i] = 0;
    yield { type: "insert", indices: [i], values: [0] };
    yield { type: "sorted", indices: [i] };
  }
}
