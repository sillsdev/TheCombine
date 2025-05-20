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
  if (arr.length <= 1) {
    return arr;
  }

  const pivotIndex = 0;
  const pivot = arr[0];

  const less: T[] = [];
  const greater: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== pivotIndex) {
      if (score(arr[i]) > score(pivot)) {
        greater.push(arr[i]);
      } else {
        less.push(arr[i]);
      }
    }
  }

  return [...quicksort(less, score), pivot, ...quicksort(greater, score)];
}

interface DateTimeSeparators {
  date?: string;
  dateTime?: string;
  time?: string;
}

export const friendlySep: DateTimeSeparators = {
  date: "/",
  dateTime: " ",
  time: ":",
};

const pathSep: DateTimeSeparators = {
  date: "-",
  dateTime: "_",
  time: "-",
};

/** Create a date-time string for the provided utc-string, or now() if not specified.
 * Use path-friendly separators by default if not specified. */
export function getDateTimeString(
  utcString?: string,
  sep?: DateTimeSeparators
): string {
  const date = new Date(utcString ?? Date.now());
  const vals = [
    date.getFullYear(),
    // Date.getMonth() starts at 0 for January.
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];
  const strs = vals.map((value) => (value < 10 ? `0${value}` : `${value}`));
  // TODO: Consider localization of the date-time formatting.
  const dateString = strs.slice(0, 3).join(sep?.date ?? pathSep.date);
  const timeString = strs.slice(3, 6).join(sep?.time ?? pathSep.time);
  return `${dateString}${sep?.dateTime ?? pathSep.dateTime}${timeString}`;
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
