import { v4 } from "uuid";

import {
  Definition,
  Gloss,
  Note,
  SemanticDomain,
  Sense,
  State,
  Word,
} from "api/models";
import { randomIntString } from "utilities";

export function newDefinition(text = "", language = ""): Definition {
  return { text, language };
}

export function newGloss(def = "", language = ""): Gloss {
  return { def, language };
}

export function newSemanticDomain(id = "", name = ""): SemanticDomain {
  return { id, name, description: "" };
}

export function newSense(
  gloss?: string,
  lang?: string,
  semDom?: SemanticDomain
): Sense {
  const sense: Sense = {
    guid: v4(),
    definitions: [],
    glosses: [],
    semanticDomains: [],
    accessibility: State.Active,
  };
  if (gloss) {
    sense.glosses.push(newGloss(gloss, lang));
  }
  if (semDom) {
    sense.semanticDomains.push(semDom);
  }
  return sense;
}

/**
 * Returns the text of the first gloss of a sense.
 * In the case that the array of glosses is empty, returns an empty string.
 */
export function firstGlossText(sense: Sense): string {
  return sense.glosses[0]?.def ?? "";
}

export function newNote(text = "", language = ""): Note {
  return { text, language };
}

export function newWord(vernacular = ""): Word {
  return {
    id: "",
    guid: v4(),
    vernacular,
    senses: [],
    audio: [],
    created: "",
    modified: "",
    accessibility: State.Active,
    history: [],
    projectId: "",
    note: newNote(),
  };
}

/** A simplified word used in DataEntry. */
export interface DomainWord {
  word: Word;
  gloss: Gloss;
}

export function simpleWord(vern: string, gloss: string): Word {
  return {
    ...newWord(vern),
    id: randomIntString(),
    senses: [newSense(gloss)],
  };
}

export function multiSenseWord(vern: string, glosses: string[]): Word {
  return {
    ...newWord(vern),
    id: randomIntString(),
    senses: glosses.map((gloss) => newSense(gloss)),
  };
}

export function testWordList(): Word[] {
  return [
    { ...simpleWord("NoSense", ""), senses: [] },
    simpleWord("Yoink", "Hello"),
    simpleWord("Yode", "Goodbye"),
    simpleWord("Yoff", "Yes"),
    simpleWord("Yank", "No"),
    simpleWord("Yank", "Please help me"),
    simpleWord("Ya", "Help"),
    simpleWord("Yeet", "Please"),
    simpleWord("Yeet", "Mandatory"),
    simpleWord("Yang", "Die"),
    multiSenseWord("Yuino", ["Love", "Boba Fett", "Life"]),
    multiSenseWord("Yuilo", ["Sadness", "Tree bark"]),
    simpleWord("Yes", "Wumbo"),
    simpleWord("Yes", "Mayonnaise"),
  ];
}

const sep = "; ";
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

export function getAnalysisLangsFromWords(words: Word[]) {
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
function wordReducer(accumulator: string[], word: Word) {
  const newLangs = word.senses
    .flatMap((s) => [...s.definitions, ...s.glosses])
    .map((dg) => dg.language);
  return [...new Set([...accumulator, ...newLangs])];
}
