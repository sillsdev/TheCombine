import { v4 } from "uuid";

import { Gloss, Note, SemanticDomain, Sense, State, Word } from "api/models";
import { randomIntString } from "utilities";

export function newGloss(def: string = "", language: string = ""): Gloss {
  return { def, language };
}

export function newSemanticDomain(
  id: string = "",
  name: string = ""
): SemanticDomain {
  return { id, name, description: "" };
}

export function newSense(
  gloss?: string,
  lang?: string,
  semDom?: SemanticDomain
): Sense {
  const sense: Sense = {
    guid: v4(),
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

export function newNote(text: string = "", language: string = ""): Note {
  return { text, language };
}

export function newWord(vernacular: string = ""): Word {
  return {
    id: "",
    guid: v4(),
    vernacular,
    plural: "",
    senses: [],
    audio: [],
    created: "",
    modified: "",
    accessibility: State.Active,
    history: [],
    partOfSpeech: "",
    editedBy: [],
    otherField: "",
    projectId: "",
    note: newNote(),
  };
}

// Used in DataEntry
export interface DomainWord {
  word: Word;
  gloss: Gloss;
}

export function hasSenses(word: Word): boolean {
  return (
    word.senses &&
    word.senses.length > 0 &&
    word.senses[0].glosses &&
    word.senses[0].glosses.length > 0
  );
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

export function getGlossLangsFromWords(words: Word[]) {
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
  const newLangs = word.senses.flatMap((s) => s.glosses).map((g) => g.language);
  return [...new Set([...accumulator, ...newLangs])];
}
