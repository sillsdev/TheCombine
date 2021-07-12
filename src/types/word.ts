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

// Used in DataEntry
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

// Used for unit testing, as the expected result, when the guids don't matter.
export function multiSenseWordAnyGuid(vern: string, glosses: string[]): Word {
  return {
    ...newWord(vern),
    id: randomIntString(),
    guid: expect.any(String),
    senses: glosses.map((gloss) => ({
      ...newSense(gloss),
      guid: expect.any(String),
    })),
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

// Removes glosses with empty def and combine glosses with same lang
export function cleanGlosses(glosses: Gloss[]): Gloss[] {
  const nonemptyGlosses = glosses.filter((g) => g.def.length);
  const langs = [...new Set(nonemptyGlosses.map((g) => g.language))];
  return langs.map((language) =>
    newGloss(
      nonemptyGlosses
        .filter((g) => g.language === language)
        .map((g) => g.def)
        .join(", "),
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
