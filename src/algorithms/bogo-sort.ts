import { SortGenerator } from "./types";

export function* bogoSort(arr: number[]): SortGenerator {
  function isSorted(): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  }

  let attempts = 0;
  const maxAttempts = 100_000;

  while (!isSorted() && attempts < maxAttempts) {
    // Check if sorted
    for (let i = 0; i < arr.length - 1; i++) {
      yield { type: "compare", indices: [i, i + 1] };
    }

    if (isSorted()) break;

    // Shuffle randomly
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
      yield { type: "swap", indices: [i, j], values: [arr[i], arr[j]] };
    }

    attempts++;
  }

  for (let i = 0; i < arr.length; i++) {
    yield { type: "sorted", indices: [i] };
  }
}
