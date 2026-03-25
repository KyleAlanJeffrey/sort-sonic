import { SortGenerator, SortOperation } from "./types";

export function* mergeSort(arr: number[]): SortGenerator {
  yield* mergeSortHelper(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    yield { type: "sorted", indices: [i] };
  }
}

function* mergeSortHelper(
  arr: number[],
  left: number,
  right: number
): Generator<SortOperation, void, undefined> {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);
  yield* mergeSortHelper(arr, left, mid);
  yield* mergeSortHelper(arr, mid + 1, right);
  yield* merge(arr, left, mid, right);
}

function* merge(
  arr: number[],
  left: number,
  mid: number,
  right: number
): Generator<SortOperation, void, undefined> {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);

  let i = 0;
  let j = 0;
  let k = left;

  while (i < leftArr.length && j < rightArr.length) {
    yield { type: "compare", indices: [left + i, mid + 1 + j] };
    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i];
      yield { type: "insert", indices: [k], values: [leftArr[i]] };
      i++;
    } else {
      arr[k] = rightArr[j];
      yield { type: "insert", indices: [k], values: [rightArr[j]] };
      j++;
    }
    k++;
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i];
    yield { type: "insert", indices: [k], values: [leftArr[i]] };
    i++;
    k++;
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j];
    yield { type: "insert", indices: [k], values: [rightArr[j]] };
    j++;
    k++;
  }
}
