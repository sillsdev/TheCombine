import { type MRT_SortingFn } from "material-react-table";

import {
  GramCatGroup,
  type GrammaticalInfo,
  type SemanticDomain,
  type Sense,
  type Word,
} from "api/models";
import { gatherDomains } from "goals/ReviewEntries/ReviewEntriesTable/Cells/DomainsCell";
import { compareFlags } from "utilities/wordUtilities";

/* Text-joining functions for definitions and glosses. */

function joinNonEmpties(texts: string[]): string {
  return texts
    .map((t) => t.trim())
    .filter((t) => t)
    .join("; ");
}

function definitionString(s: Sense[]): string {
  return joinNonEmpties(s.flatMap((s) => s.definitions.map((d) => d.text)));
}

function glossesString(s: Sense[]): string {
  return joinNonEmpties(s.flatMap((s) => s.glosses.map((g) => g.def)));
}

/* Comparison functions for grammatical info. */

function compareGramInfo(a: GrammaticalInfo, b: GrammaticalInfo): number {
  return a.catGroup === b.catGroup
    ? a.grammaticalCategory.localeCompare(b.grammaticalCategory)
    : a.catGroup === GramCatGroup.Unspecified
      ? 1
      : b.catGroup === GramCatGroup.Unspecified
        ? -1
        : a.catGroup.localeCompare(b.catGroup);
}

function compareSensesGramInfo(a: Sense[], b: Sense[]): number {
  let compare = 0;
  for (let i = 0; compare === 0 && i < a.length && i < b.length; i++) {
    compare = compareGramInfo(a[i].grammaticalInfo, b[i].grammaticalInfo);
  }
  return compare || a.length - b.length;
}

/* Comparison functions for semantic domains. */

function compareDomains(a: SemanticDomain[], b: SemanticDomain[]): number {
  // Special case: no domains sorted to last
  if (!a.length || !b.length) {
    return b.length - a.length;
  }
  // Compare the domains
  let compare = 0;
  for (let i = 0; compare === 0 && i < a.length && i < b.length; i++) {
    compare = a[i].id.localeCompare(b[i].id);
  }
  return compare || a.length - b.length;
}

/* Custom `sortingFn` functions for `MaterialReactTable` columns. */

/** Takes vernacular language bcp47 string.
 * Returns a function that localCompares the vernacular forms. */
export const sortingFnVernacular =
  (lang: string): MRT_SortingFn<Word> =>
  (a, b) =>
    a.original.vernacular.localeCompare(b.original.vernacular, lang);

/** Concatenates all sense definition texts for each word, then compares strings. */
export const sortingFnDefinitions: MRT_SortingFn<Word> = (a, b) =>
  definitionString(a.original.senses).localeCompare(
    definitionString(b.original.senses)
  );

/** Concatenates all sense gloss defs for each word, then compares strings. */
export const sortingFnGlosses: MRT_SortingFn<Word> = (a, b) =>
  glossesString(a.original.senses).localeCompare(
    glossesString(b.original.senses)
  );

/** Compares grammatical info of `.senses[i]` of the words, starting at `i = 0`. */
export const sortingFnPartOfSpeech: MRT_SortingFn<Word> = (a, b) =>
  compareSensesGramInfo(a.original.senses, b.original.senses);

/** Compares semantic domains with the lowest id of all the senses of each word. */
export const sortingFnDomains: MRT_SortingFn<Word> = (a, b) =>
  compareDomains(
    gatherDomains(a.original.senses),
    gatherDomains(b.original.senses)
  );

/** Compares note text. */
export const sortingFnNote: MRT_SortingFn<Word> = (a, b) =>
  a.original.note.text.localeCompare(b.original.note.text);

/** Compares flags: `.active = true` before `= false`, then `.text` alphabetically. */
export const sortingFnFlag: MRT_SortingFn<Word> = (a, b) =>
  compareFlags(a.original.flag, b.original.flag);
