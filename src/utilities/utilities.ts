import { colorblindSafePalette, HEX } from "types/theme";

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
  const dateString = strs.slice(0, 3).join(sep?.date ?? pathSep.date);
  const timeString = strs.slice(3, 6).join(sep?.time ?? pathSep.time);
  return `${dateString}${sep?.dateTime ?? pathSep.dateTime}${timeString}`;
}

/** Uses `Date.toLocaleString`. Example outputs:
 * - (`lang="ar"`) الاثنين، 18 أغسطس 2025، 9:23 ص
 * - (`lang="en"`) Mon, Aug 18, 2025, 9:23 AM
 * - (`lang="es"`) lun, 18 ago 2025, 9:23 a. m.
 * - (`lang="fr"`) lun. 18 août 2025, 9:23 AM
 * - (`lang="pt"`) seg., 18 de ago. de 2025, 9:23 AM
 * - (`lang="zh"`) 2025年8月18日周一 上午9:23 */
export function getLocalizedDateTimeString(
  utcString?: string,
  lang?: string
): string {
  return new Date(utcString ?? Date.now()).toLocaleString(lang, {
    day: "numeric",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
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

/** Computes similarity of two 2-digit hex strings:
 * - 0 means identical
 * - 1 means `00` and `ff` */
function compareHexPairs(a: string, b: string): number {
  return Math.abs(parseInt(a, 16) - parseInt(b, 16)) / 255;
}

/** Computes similarity of two rbg hex strings:
 * - 0 means identical
 * - 1 means #000000 and #ffffff */
function compareColors(a: HEX, b: HEX): number {
  const rDiff = compareHexPairs(a.slice(1, 3), b.slice(1, 3));
  const gDiff = compareHexPairs(a.slice(3, 5), b.slice(3, 5));
  const bDiff = compareHexPairs(a.slice(5, 7), b.slice(5, 7));
  return (rDiff + gDiff + bDiff) / 3;
}

const black: HEX = "#000000";
const white: HEX = "#ffffff";

/** Generates array of distinct colors. Starts with the `include` colors
 * (default: black and `colorblindSafePalette` colors), then randomly and
 * inefficiently generates more colors as needed, avoiding the `avoid` colors
 * (default: white). */
export function distinctColors(
  n: number,
  include = [black, ...Object.values(colorblindSafePalette)],
  avoid = [white],
  threshold = 0.15
): HEX[] {
  if (n < 1) {
    return [];
  }
  if (n > 40) {
    throw new Error(`distinctColors(n) cannot handle n = ${n} (> 40)`);
  }
  const colors = [...include];
  while (colors.length < n) {
    const randHexInt = Math.trunc(Math.random() * 0x1000000);
    const col: HEX = `#${randHexInt.toString(16).padStart(6, "0")}`;
    if ([...colors, ...avoid].every((c) => compareColors(c, col) > threshold)) {
      colors.push(col);
    }
  }
  return colors.slice(0, n);
}

/** Given an array, returns an array with items that appear more than once. */
export function getDuplicates<T>(ids: T[]): T[] {
  const counts = ids.reduce((map, id) => {
    map.set(id, (map.get(id) ?? 0) + 1);
    return map;
  }, new Map<T, number>());

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
}
