export function meetsPasswordRequirements(password: string): boolean {
  return password.length >= 8;
}

export function meetsUsernameRequirements(username: string): boolean {
  return username.length >= 3;
}

export function randElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomIntString(): string {
  return Math.floor(Math.random() * 9999999).toString();
}

/** Quicksort implementation O(n log n). */
export function quicksort<T>(arr: T[], score: (item: T) => number): T[] {
  if (arr.length <= 1) return arr;

  const pivotIndex = 0;
  const pivot = arr[0];

  const less = [];
  const greater = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== pivotIndex) {
      score(arr[i]) > score(pivot) ? greater.push(arr[i]) : less.push(arr[i]);
    }
  }

  return [...quicksort(less, score), pivot, ...quicksort(greater, score)];
}

export function getNowDateTimeString(): string {
  const now = new Date(Date.now());
  const vals = [
    now.getFullYear(),
    // Date.getMonth() starts at 0 for January.
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ];
  const strs = vals.map((value) => (value < 10 ? `0${value}` : `${value}`));
  return `${strs.slice(0, 3).join("-")}_${strs.slice(3, 6).join("-")}`;
}

// A general-purpose edit distance.
export interface LevenshteinDistParams {
  delCost: number;
  insCost: number;
  subCost: number; // Must be < delCost + insCost to be relevant.
}
export const DefaultLevDistParams: LevenshteinDistParams = {
  delCost: 1,
  insCost: 1,
  subCost: 1,
};
export class LevenshteinDistance {
  readonly deletionCost: number;
  readonly insertionCost: number;
  readonly substitutionCost: number;
  constructor(params: LevenshteinDistParams = DefaultLevDistParams) {
    this.deletionCost = params.delCost;
    this.insertionCost = params.insCost;
    this.substitutionCost = params.subCost;
  }
  getDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [];
      for (let j = 0; j <= b.length; j++) {
        // Populate first row & column.
        if (i === 0 || j === 0) {
          matrix[i][j] = i * this.deletionCost + j * this.insertionCost;
          continue;
        }
        // Recursively compute other entries.
        const tempSubCost = a[i - 1] === b[j - 1] ? 0 : this.substitutionCost;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + this.deletionCost,
          matrix[i][j - 1] + this.insertionCost,
          matrix[i - 1][j - 1] + tempSubCost
        );
      }
    }
    return matrix[a.length][b.length];
  }
}
