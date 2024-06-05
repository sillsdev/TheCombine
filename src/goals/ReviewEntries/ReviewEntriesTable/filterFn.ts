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

/* Custom `filterFn` functions for `MaterialReactTable` columns.
 * (Can always assume that `filterValue` will be truthy.) */

/** Requires the accessor return type to be `Dictionary[]`. */
export const filterFnDefinitions: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  const definitions = row.getValue<Definition[]>(id);
  const filter = filterValue.trim().toLowerCase();
  return definitions.some((d) => d.text.toLowerCase().includes(filter));
};

/** Requires the accessor return type to be `Gloss[]`. */
export const filterFnGlosses: MRT_FilterFn<Word> = (
  row,
  id,
  filterValue: string
) => {
  const glosses = row.getValue<Gloss[]>(id);
  const filter = filterValue.trim().toLowerCase();
  return glosses.some((g) => g.def.toLowerCase().includes(filter));
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
    const filter = filterValue.trim().toLocaleLowerCase();
    return (
      audio.length === parseInt(filter) ||
      audio.some((p) => !filter || speakers[p.speakerId]?.includes(filter))
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
  const filter = filterValue.trim().toLowerCase();
  return flag.text.toLowerCase().includes(filter);
};
