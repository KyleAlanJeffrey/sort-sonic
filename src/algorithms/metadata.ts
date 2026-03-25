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
      "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
    timeComplexity: { best: "O(n)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: true,
    explanation:
      "Bubble Sort works by repeatedly walking through the array, comparing each pair of adjacent elements and swapping them if they\u2019re in the wrong order. After each full pass, the largest unsorted element \u201Cbubbles up\u201D to its correct position at the end. The algorithm keeps making passes until no swaps are needed, meaning the array is sorted. It\u2019s simple but inefficient for large datasets.",
  },
  {
    slug: "selection-sort",
    name: "Selection Sort",
    fn: selectionSort,
    description:
      "Finds the minimum element from the unsorted part and puts it at the beginning.",
    timeComplexity: { best: "O(n\u00B2)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: false,
    explanation:
      "Selection Sort divides the array into a sorted and unsorted region. On each pass, it scans the unsorted region to find the smallest element, then swaps it into the next position of the sorted region. This continues until the entire array is sorted. It always makes O(n\u00B2) comparisons regardless of the input.",
  },
  {
    slug: "insertion-sort",
    name: "Insertion Sort",
    fn: insertionSort,
    description:
      "Builds the sorted array one item at a time by inserting each element into its correct position.",
    timeComplexity: { best: "O(n)", average: "O(n\u00B2)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(1)",
    stable: true,
    explanation:
      "Insertion Sort builds a sorted portion of the array from left to right. For each new element, it shifts larger sorted elements to the right to make room, then inserts the element in its correct position. It\u2019s efficient for small or nearly-sorted datasets and is the algorithm most people use when sorting a hand of playing cards.",
  },
  {
    slug: "merge-sort",
    name: "Merge Sort",
    fn: mergeSort,
    description:
      "Divides the array in half, recursively sorts each half, then merges the sorted halves.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)",
    stable: true,
    explanation:
      "Merge Sort uses a divide-and-conquer strategy. It splits the array in half recursively until each sub-array has one element, then merges them back together in sorted order. The merge step is the key operation \u2014 it combines two sorted arrays into one by comparing their front elements. It guarantees O(n log n) time but requires extra memory for the temporary arrays.",
  },
  {
    slug: "quick-sort",
    name: "Quick Sort",
    fn: quickSort,
    description:
      "Picks a pivot element, partitions the array around it, then recursively sorts each partition.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n\u00B2)" },
    spaceComplexity: "O(log n)",
    stable: false,
    explanation:
      "Quick Sort selects a pivot element and partitions the array so that elements smaller than the pivot go to the left and larger ones go to the right. It then recursively sorts both partitions. The choice of pivot matters \u2014 a bad pivot leads to O(n\u00B2) performance, but on average it\u2019s one of the fastest general-purpose sorting algorithms.",
  },
  {
    slug: "heap-sort",
    name: "Heap Sort",
    fn: heapSort,
    description:
      "Builds a max heap from the array, then repeatedly extracts the maximum to build the sorted result.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(1)",
    stable: false,
    explanation:
      "Heap Sort first transforms the array into a max heap \u2014 a complete binary tree where every parent is larger than its children. It then repeatedly removes the root (the maximum element), places it at the end of the array, and re-heapifies the remaining elements. This guarantees O(n log n) time with O(1) extra space, making it useful when memory is constrained.",
  },
];

export function getAlgorithm(slug: string): Algorithm | undefined {
  return algorithms.find((a) => a.slug === slug);
}

export const algorithmSlugs = algorithms.map((a) => a.slug);
