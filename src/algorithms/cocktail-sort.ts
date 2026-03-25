import { SortGenerator } from "./types";

export function* cocktailSort(arr: number[]): SortGenerator {
  // Bubble sort that goes both directions — like a cocktail shaker
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    // Forward pass (like regular bubble sort)
    for (let i = start; i < end; i++) {
      yield { type: "compare", indices: [i, i + 1] };
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        yield { type: "swap", indices: [i, i + 1], values: [arr[i], arr[i + 1]] };
        swapped = true;
      }
    }
    yield { type: "sorted", indices: [end] };
    end--;

    if (!swapped) break;

    swapped = false;

    // Backward pass (the twist)
    for (let i = end; i > start; i--) {
      yield { type: "compare", indices: [i - 1, i] };
      if (arr[i - 1] > arr[i]) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        yield { type: "swap", indices: [i - 1, i], values: [arr[i - 1], arr[i]] };
        swapped = true;
      }
    }
    yield { type: "sorted", indices: [start] };
    start++;
  }

  for (let i = start; i <= end; i++) {
    yield { type: "sorted", indices: [i] };
  }
}
