import {
  type Definition,
  type Gloss,
  GramCatGroup,
  type SemanticDomain,
  type Sense,
  Status,
  type Word,
} from "api/models";
import { newFlag, newNote } from "types/word";

/** Trim whitespace off all definition texts, then remove those with empty text.  */
function trimDefinitions(definitions: Definition[]): Definition[] {
  return definitions
    .map((d) => ({ ...d, text: d.text.trim() }))
    .filter((d) => d.text.length);
}

/** Trim whitespace off all gloss defs, then remove those with empty def.  */
function trimGlosses(glosses: Gloss[]): Gloss[] {
  return glosses
    .map((g) => ({ ...g, def: g.def.trim() }))
    .filter((g) => g.def.length);
}

/** Check if two definition arrays have the same content. */
export function areDefinitionsSame(a: Definition[], b: Definition[]): boolean {
  a = trimDefinitions(a);
  b = trimDefinitions(b);
  return (
    a.length === b.length &&
    a.every((ad) =>
      b.some((bd) => ad.language === bd.language && ad.text === bd.text)
    )
  );
}

/** Check if two gloss arrays have the same content. */
export function areGlossesSame(a: Gloss[], b: Gloss[]): boolean {
  a = trimGlosses(a);
  b = trimGlosses(b);
  return (
    a.length === b.length &&
    a.every((ag) =>
      b.some((bg) => ag.language === bg.language && ag.def === bg.def)
    )
  );
}

/** Check if two semantic domain arrays have the same content. */
export function areDomainsSame(
  a: SemanticDomain[],
  b: SemanticDomain[]
): boolean {
  return (
    a.every((ad) => b.some((bd) => ad.id === bd.id)) &&
    b.every((bd) => a.some((ad) => ad.id === bd.id))
  );
}

/** Check whether a sense is substantively different. */
export function isSenseChanged(oldSense: Sense, newSense: Sense): boolean {
  return (
    oldSense.guid !== newSense.guid ||
    oldSense.accessibility !== newSense.accessibility ||
    oldSense.grammaticalInfo.catGroup !== newSense.grammaticalInfo.catGroup ||
    oldSense.grammaticalInfo.grammaticalCategory !==
      newSense.grammaticalInfo.grammaticalCategory ||
    !areDefinitionsSame(oldSense.definitions, newSense.definitions) ||
    !areGlossesSame(oldSense.glosses, newSense.glosses) ||
    !areDomainsSame(oldSense.semanticDomains, newSense.semanticDomains)
  );
}

/** Return a cleaned sense ready to be saved:
 * - If a sense is marked as deleted or is utterly blank, return undefined
 * - If a sense lacks gloss, return error string
 *
 * (If `exemptProtected = true`, protected senses are allowed to be without gloss.) */
export function cleanSense(
  newSense: Sense,
  exemptProtected = false
): Sense | string | undefined {
  // Ignore deleted senses.
  if (newSense.accessibility === Status.Deleted) {
    return;
  }

  // Remove empty definitions, empty glosses, and duplicate domains.
  newSense.definitions = trimDefinitions(newSense.definitions);
  newSense.glosses = trimGlosses(newSense.glosses);
  const domainIds = [...new Set(newSense.semanticDomains.map((dom) => dom.id))];
  domainIds.sort();
  newSense.semanticDomains = domainIds.map(
    (id) => newSense.semanticDomains.find((dom) => dom.id === id)!
  );

  // Bypass the following checks on protected senses.
  if (exemptProtected && newSense.accessibility === Status.Protected) {
    return newSense;
  }

  // Skip empty senses.
  if (
    newSense.definitions.length === 0 &&
    newSense.glosses.length === 0 &&
    newSense.grammaticalInfo.catGroup === GramCatGroup.Unspecified &&
    newSense.semanticDomains.length === 0
  ) {
    return;
  }

  // Don't allow senses without a gloss.
  if (!newSense.glosses.length) {
    return "reviewEntries.error.gloss";
  }

  return newSense;
}

/** Clean a word. Return error string id if:
 * - the vernacular field is empty
 * - all senses are empty/deleted
 *
 * (If `exemptProtected = true`, protected senses are allowed to be empty.) */
export function cleanWord(word: Word, exemptProtected = false): Word | string {
  // Make sure vernacular isn't empty.
  const vernacular = word.vernacular.trim();
  if (!vernacular.length) {
    return "reviewEntries.error.vernacular";
  }

  // Clean senses and check for problems.
  const senses: Sense[] = [];
  for (const sense of word.senses) {
    const cleanedSense = cleanSense(sense, exemptProtected);
    // Skip deleted or empty senses.
    if (!cleanedSense) {
      continue;
    }
    // Don't allow senses without a gloss.
    if (typeof cleanedSense === "string") {
      return cleanedSense;
    }
    senses.push(sense);
  }
  if (!senses.length) {
    return "reviewEntries.error.senses";
  }

  // Clear note language if text empty.
  const noteText = word.note.text.trim();
  const note = newNote(noteText, noteText ? word.note.language : "");

  // Clear flag text if flag not active.
  const flagActive = word.flag.active;
  const flag = newFlag(flagActive ? word.flag.text.trim() : undefined);
  flag.active = flagActive;

  return { ...word, flag, note, senses, vernacular };
}
