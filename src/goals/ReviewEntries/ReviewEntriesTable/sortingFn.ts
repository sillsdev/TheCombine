import { type MRT_SortingFn } from "material-react-table";

import {
  type Word,
  type SemanticDomain,
  type GrammaticalInfo,
  GramCatGroup,
  type Sense,
} from "api/models";
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
  // Special case: no domains
  if (!a.length || !b.length) {
    return b.length - a.length;
  }
  // Compare the domains
  let compare = 0;
  for (let i = 0; compare === 0 && i < a.length && i < b.length; i++) {
    compare = a[i].id.localeCompare(b[i].id);
  }
  return compare;
}
function compareSensesDomains(a: Sense[], b: Sense[]): number {
  // Special case: no domains
  if (!a.length || !b.length) {
    return b.length - a.length;
  }
  // Compare the senses
  let compare = 0;
  for (let i = 0; compare === 0 && i < a.length && i < b.length; i++) {
    compare = compareDomains(a[i].semanticDomains, b[i].semanticDomains);
  }
  return compare;
}

/* Custom `sortingFn` functions for `MaterialReactTable` columns. */

export const sortingFnDefinitions: MRT_SortingFn<Word> = (a, b) =>
  definitionString(a.original.senses).localeCompare(
    definitionString(b.original.senses)
  );

export const sortingFnGlosses: MRT_SortingFn<Word> = (a, b) =>
  glossesString(a.original.senses).localeCompare(
    glossesString(b.original.senses)
  );

export const sortingFnPartOfSpeech: MRT_SortingFn<Word> = (a, b) =>
  compareSensesGramInfo(a.original.senses, b.original.senses);

export const sortingFnDomains: MRT_SortingFn<Word> = (a, b) =>
  compareSensesDomains(a.original.senses, b.original.senses);

export const sortingFnFlag: MRT_SortingFn<Word> = (a, b) =>
  compareFlags(a.original.flag, b.original.flag);
