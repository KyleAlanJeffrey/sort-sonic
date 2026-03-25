export type OperationType = "compare" | "swap" | "insert" | "sorted";

export type SortOperation = {
  type: OperationType;
  indices: number[];
  values?: number[];
};

export type SortGenerator = Generator<SortOperation, void, undefined>;

export type AlgorithmFn = (arr: number[]) => SortGenerator;

export type AlgorithmMeta = {
  slug: string;
  name: string;
  description: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable: boolean;
  explanation: string;
};
