import { type MRT_FilterFn } from "material-react-table";

import {
  type Gloss,
  type Definition,
  type Word,
  type SemanticDomain,
  type Pronunciation,
  type Flag,
} from "api/models";
import { type Hash } from "types/hash";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fuzzySearch } = require("levenshtein-search");

/** Checks if string starts and ends with quote marks.
 * For simplicity, allows mismatched quote types. */
export function isQuoted(filter: string): boolean {
  return /^["'\p{Pi}].*["'\p{Pf}]$/u.test(filter);
}

/** Number of typos allowed, depending on filter-length. */
function levDist(len: number): number {
  return len < 3 ? 0 : len < 6 ? 1 : 2;
}

/** Checks if value contains a substring that fuzzy-matches the filter. */
export function fuzzyContains(value: string, filter: string): boolean {
  filter = filter.toLowerCase();
  value = value.toLowerCase();
  // `fuzzySearch(...)` returns a generator;
  // `.next()` on a generator always returns an object with boolean property `done`
  return !fuzzySearch(filter, value, levDist(filter.length)).next().done;
}

/** Check if string matches filter.
 * If filter quoted, exact match. Otherwise, fuzzy match. */
export function matchesFilter(value: string, filter: string): boolean {
  if (filter && !filter.trim()) {
    // Whitespace-only filter always matches a non-empty value.
    return !!value;
  }

  filter = filter.trim().normalize("NFC");
  return isQuoted(filter)
    ? value.includes(filter.substring(1, filter.length - 1).trim())
    : fuzzyContains(value, filter);
}

/* Custom `filterFn` functions for `MaterialReactTable` columns.
 * (Can always assume that `filterValue` will be truthy.) */

/** Requires the accessor return type to be `string`. */
export const filterFnString: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  return matchesFilter(row.getValue<string>(id), filterValue);
};

/** Requires the accessor return type to be `Definition[]`. */
export const filterFnDefinitions: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  const definitions = row.getValue<Definition[]>(id);
  return definitions.some((d) => matchesFilter(d.text, filterValue));
};

/** Requires the accessor return type to be `Gloss[]`. */
export const filterFnGlosses: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  const glosses = row.getValue<Gloss[]>(id);
  return glosses.some((g) => matchesFilter(g.def, filterValue));
};

/** Requires the accessor return type to be `SemanticDomain[]`. */
export const filterFnDomains: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  /* Numeric id filter expected (periods between digits are optional).
   * Test for exact id match if no final period.
   * Test for initial substring match if final period. */
  const doms = row.getValue<SemanticDomain[]>(id);
  if (!doms.length) {
    // A filter has been typed and there are no domains
    return false;
  }
  if (!filterValue.trim()) {
    // The typed filter is whitespace
    return true;
  }
  let filter = filterValue.replace(/[^0-9\.]/g, "");
  if (!filter) {
    // The typed filter has no digits or periods
    return false;
  }
  // Check if the filter ends with a period rather than a digit
  const finalPeriod = filter.slice(-1) === ".";
  // Remove all periods and put periods between digits
  filter = filter.replace(/\./g, "").split("").join(".");
  if (finalPeriod) {
    // There is a period after the final digit (or no digits)
    return doms.some((d) => d.id.startsWith(filter));
  } else {
    // There is not a period after the final digit
    return doms.some((d) => d.id === filter);
  }
};

/** Takes a speaker dictionary with ids as keys and names as values.
 * Returns a function that requires the accessor return type to be `Pronunciation[]`. */
export const filterFnPronunciations =
  (speakers: Hash<string>): MRT_FilterFn<Word> =>
  (row, id, filterValue: string) => {
    /* Match either number of pronunciations or a speaker name.
     * (Whitespace will match all audio, even without a speaker.) */
    const audio = row.getValue<Pronunciation[]>(id);
    const filter = filterValue.trim();
    return (
      (audio.length && !filter) ||
      audio.length === parseInt(filter) ||
      audio.some(
        (p) =>
          p.speakerId in speakers &&
          matchesFilter(speakers[p.speakerId], filter)
      )
    );
  };

/** Requires the accessor return type to be `Flag`. */
export const filterFnFlag: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  const flag = row.getValue<Flag>(id);
  if (!flag.active) {
    // A filter has been typed and the word isn't flagged
    return false;
  }
  return matchesFilter(flag.text, filterValue);
};
