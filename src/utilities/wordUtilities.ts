import { Definition, Flag, Gloss, Sense, Word } from "api/models";
import { newDefinition, newGloss } from "types/word";

export const sep = "; ";
/** Removes definitions with empty def and combine glosses with same lang. */
export function cleanDefinitions(defs: Definition[]): Definition[] {
  const nonempty = defs.filter((d) => d.text.length);
  const langs = [...new Set(nonempty.map((d) => d.language))];
  return langs.map((language) =>
    newDefinition(
      nonempty
        .filter((d) => d.language === language)
        .map((d) => d.text)
        .join(sep),
      language
    )
  );
}
/** Removes glosses with empty def and combine glosses with same lang. */
export function cleanGlosses(glosses: Gloss[]): Gloss[] {
  const nonempty = glosses.filter((g) => g.def.length);
  const langs = [...new Set(nonempty.map((g) => g.language))];
  return langs.map((language) =>
    newGloss(
      nonempty
        .filter((g) => g.language === language)
        .map((g) => g.def)
        .join(sep),
      language
    )
  );
}

/**
 * For sorting flags alphabetically by their text,
 * where a flag with .active=false is alphabetically last.
 */
export function compareFlags(a: Flag, b: Flag): number {
  return a.active && b.active
    ? a.text.localeCompare(b.text)
    : a.active
    ? -1
    : b.active
    ? 1
    : 0;
}

/**
 * Returns the text of the first gloss of a sense.
 * In the case that the array of glosses is empty, returns an empty string.
 */
export function firstGlossText(sense: Sense): string {
  return sense.glosses[0]?.def ?? "";
}

/**
 * Given a word-array, return a string-array with any language code found in
 * a definition or gloss of any sense.
 */
export function getAnalysisLangsFromWords(words: Word[]): string[] {
  return reduceMultiType<Word, string[]>(words, [], wordReducer);
}
function reduceMultiType<A, B>(
  toReduce: A[],
  initial: B,
  reducer: (accumulator: B, currentItem: A) => B
): B {
  let accumulated = initial;
  toReduce.forEach((item) => (accumulated = reducer(accumulated, item)));
  return accumulated;
}
function wordReducer(accumulator: string[], word: Word): string[] {
  const newLangs = word.senses
    .flatMap((s) => [...s.definitions, ...s.glosses])
    .map((dg) => dg.language);
  return [...new Set([...accumulator, ...newLangs])];
}
