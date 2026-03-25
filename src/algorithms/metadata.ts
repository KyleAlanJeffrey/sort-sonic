import { AlgorithmMeta, AlgorithmFn } from "./types";
import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";
import { insertionSort } from "./insertion-sort";
import { mergeSort } from "./merge-sort";
import { quickSort } from "./quick-sort";
import { heapSort } from "./heap-sort";
import { bogoSort } from "./bogo-sort";
import { stalinSort } from "./stalin-sort";
import { cocktailSort } from "./cocktail-sort";

export type Algorithm = AlgorithmMeta & { fn: AlgorithmFn };

export const algorithms: Algorithm[] = [
  {
    slug: "bubble-sort",
    name: "Bubble Sort",
    fn: bubbleSort,
    description:
      "Compares adjacent elements and swaps them if out of order, bubbling the largest to the end each pass.",
    timeComplexity: { best: "O(n)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: true,
    explanation:
      "Bubble Sort walks through the array comparing each pair of adjacent elements, swapping them if they\u2019re in the wrong order. After each pass the largest unsorted element \u201Cbubbles\u201D to its final position. Passes repeat until no swaps are needed.",
    code: `for (let i = 0; i < length; i++) {
  for (let j = 0; j < length - i - 1; j++) {
    if (compare(j, j + 1)) {
      swap(j, j + 1);
    }
  }
}`,
  },
  {
    slug: "selection-sort",
    name: "Selection Sort",
    fn: selectionSort,
    description:
      "Finds the minimum element in the unsorted region and swaps it into the next sorted position.",
    timeComplexity: { best: "O(n\u00B2)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: false,
    explanation:
      "Selection Sort divides the array into sorted and unsorted regions. Each pass scans the unsorted region for the smallest element, then swaps it into the next sorted position. Always makes O(n\u00B2) comparisons regardless of input order.",
    code: `for (let i = 0; i < length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < length; j++) {
    if (compare(minIdx, j)) {
      minIdx = j;
    }
  }
  if (minIdx !== i) {
    swap(i, minIdx);
  }
}`,
  },
  {
    slug: "insertion-sort",
    name: "Insertion Sort",
    fn: insertionSort,
    description:
      "Builds a sorted array one element at a time by inserting each into its correct position.",
    timeComplexity: { best: "O(n)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: true,
    explanation:
      "Insertion Sort builds a sorted portion from left to right. For each new element, it shifts larger sorted elements right to make room, then inserts the element in place. Efficient for small or nearly-sorted data.",
    code: `for (let i = 1; i < length; i++) {
  let j = i;
  while (j > 0 && compare(j - 1, j)) {
    swap(j - 1, j);
    j--;
  }
}`,
  },
  {
    slug: "merge-sort",
    name: "Merge Sort",
    fn: mergeSort,
    description:
      "Recursively splits the array in half, then merges sorted halves back together.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)",
    stable: true,
    explanation:
      "Merge Sort splits the array recursively until each piece has one element, then merges them back in sorted order. Guarantees O(n log n) time but needs extra memory for temporary arrays.",
    code: `// Merge sort using get/set helpers
function mergeSort(lo, hi) {
  if (hi - lo <= 1) return;
  const mid = (lo + hi) >> 1;
  mergeSort(lo, mid);
  mergeSort(mid, hi);
  // Copy both halves into temp arrays first
  const left = [], right = [];
  for (let i = lo; i < mid; i++) left.push(get(i));
  for (let i = mid; i < hi; i++) right.push(get(i));
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      set(k++, left[i++]);
    } else {
      set(k++, right[j++]);
    }
  }
  while (i < left.length) set(k++, left[i++]);
  while (j < right.length) set(k++, right[j++]);
}
mergeSort(0, length);`,
  },
  {
    slug: "quick-sort",
    name: "Quick Sort",
    fn: quickSort,
    description:
      "Picks a pivot, partitions elements around it, then recursively sorts each partition.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(log n)",
    stable: false,
    explanation:
      "Quick Sort picks a pivot and partitions the array so smaller elements go left, larger go right. It recursively sorts both sides. Pivot choice matters \u2014 bad pivots cause O(n\u00B2), but average case is among the fastest.",
    code: `function quickSort(lo, hi) {
  if (lo >= hi) return;
  // Partition with last element as pivot
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (compare(hi, j)) {
      swap(i, j);
      i++;
    }
  }
  swap(i, hi);
  quickSort(lo, i - 1);
  quickSort(i + 1, hi);
}
quickSort(0, length - 1);`,
  },
  {
    slug: "heap-sort",
    name: "Heap Sort",
    fn: heapSort,
    description:
      "Builds a max heap, then repeatedly extracts the maximum to produce sorted order.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(1)",
    stable: false,
    explanation:
      "Heap Sort builds a max heap (every parent larger than its children), then repeatedly swaps the root to the end and re-heapifies. Guarantees O(n log n) with O(1) extra space.",
    code: `function heapify(n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && compare(left, largest))
    largest = left;
  if (right < n && compare(right, largest))
    largest = right;
  if (largest !== i) {
    swap(i, largest);
    heapify(n, largest);
  }
}
// Build max heap
for (let i = (length >> 1) - 1; i >= 0; i--) {
  heapify(length, i);
}
// Extract elements
for (let i = length - 1; i > 0; i--) {
  swap(0, i);
  heapify(i, 0);
}`,
  },
  {
    slug: "bogo-sort",
    name: "Bogo Sort",
    fn: bogoSort,
    description:
      "Randomly shuffles the array, checks if it\u2019s sorted, and repeats. The monkey with a typewriter approach.",
    timeComplexity: { best: "O(n)", average: "O((n+1)!)", worst: "O(\u221E)" },
    spaceComplexity: "O(1)",
    stable: false,
    explanation:
      "Bogo Sort (a.k.a. Stupid Sort, Monkey Sort) works by randomly shuffling the entire array, then checking if it happens to be sorted. If not, shuffle again. Average case is O((n+1)!) which means for 10 elements you\u2019d expect ~40 million shuffles. For 15 elements, heat death of the universe. Use small arrays unless you have a lot of patience.",
    code: `// Bogo Sort: shuffle until sorted
// WARNING: Use a VERY small array size
function isSorted() {
  for (let i = 0; i < length - 1; i++) {
    if (compare(i, i + 1)) return false;
  }
  return true;
}

let attempts = 0;
while (!isSorted() && attempts < 100000) {
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    swap(i, j);
  }
  attempts++;
}`,
  },
  {
    slug: "stalin-sort",
    name: "Stalin Sort",
    fn: stalinSort,
    description:
      "Elements that are out of order are simply eliminated. The survivors are sorted. O(n) time, comrade.",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)",
    stable: true,
    explanation:
      "Stalin Sort iterates through the array once. Any element smaller than the previous one is \u201Cpurged.\u201D The remaining elements are, by definition, in sorted order. It\u2019s O(n) and technically correct \u2014 the best kind of correct. The downside is your array gets shorter. A lot shorter. But the survivors are very well organized.",
    code: `// Stalin Sort: eliminate the disobedient
let lastGood = 0;
for (let i = 1; i < length; i++) {
  if (!compare(lastGood, i)) {
    lastGood = i;
  }
  // out-of-order elements are simply ignored
}`,
  },
  {
    slug: "cocktail-sort",
    name: "Cocktail Sort",
    fn: cocktailSort,
    description:
      "Bubble sort that shakes in both directions, like a bartender mixing a cocktail.",
    timeComplexity: { best: "O(n)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: true,
    explanation:
      "Cocktail Shaker Sort (a.k.a. Bidirectional Bubble Sort) is a variation of Bubble Sort that traverses the array in both directions alternately. The forward pass bubbles the largest element to the end, then the backward pass bubbles the smallest to the beginning. It\u2019s slightly better than Bubble Sort for arrays where small elements are stuck at the end (\"turtles\"), but still O(n\u00B2).",
    code: `let start = 0;
let end = length - 1;
let swapped = true;
while (swapped) {
  swapped = false;
  for (let i = start; i < end; i++) {
    if (compare(i, i + 1)) {
      swap(i, i + 1);
      swapped = true;
    }
  }
  end--;
  if (!swapped) break;
  swapped = false;
  for (let i = end; i > start; i--) {
    if (compare(i - 1, i)) {
      swap(i - 1, i);
      swapped = true;
    }
  }
  start++;
}`,
  },
];

export function getAlgorithm(slug: string): Algorithm | undefined {
  return algorithms.find((a) => a.slug === slug);
}

export const algorithmSlugs = algorithms.map((a) => a.slug);
