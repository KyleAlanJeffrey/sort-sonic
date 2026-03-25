import { AlgorithmMeta, AlgorithmFn } from "./types";
import { bubbleSort } from "./bubble-sort";
import { selectionSort } from "./selection-sort";
import { insertionSort } from "./insertion-sort";
import { mergeSort } from "./merge-sort";
import { quickSort } from "./quick-sort";
import { heapSort } from "./heap-sort";

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
// (recursive approach with auxiliary storage)
function mergeSort(lo, hi) {
  if (hi - lo <= 1) return;
  const mid = (lo + hi) >> 1;
  mergeSort(lo, mid);
  mergeSort(mid, hi);
  // Merge step
  const tmp = [];
  let i = lo, j = mid;
  while (i < mid && j < hi) {
    // compare uses original indices
    if (!compare(j, i)) {
      tmp.push(get(i++));
    } else {
      tmp.push(get(j++));
    }
  }
  while (i < mid) tmp.push(get(i++));
  while (j < hi) tmp.push(get(j++));
  for (let k = 0; k < tmp.length; k++) {
    set(lo + k, tmp[k]);
  }
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
  if (left < n && compare(largest, left))
    largest = left;
  if (right < n && compare(largest, right))
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
];

export function getAlgorithm(slug: string): Algorithm | undefined {
  return algorithms.find((a) => a.slug === slug);
}

export const algorithmSlugs = algorithms.map((a) => a.slug);
