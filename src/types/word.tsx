import { v4 } from "uuid";

import { randomIntString } from "utilities";
import {
  Gloss,
  MergeSourceWord,
  MergeWords,
  Note as INote,
  SemanticDomain as ISemanticDomain,
  SemanticDomainWithSubdomains,
  Sense as ISense,
  State,
  Word as IWord,
} from "api/models";

// Re-export interfaces from backend models.
export type {
  Gloss,
  MergeSourceWord,
  MergeWords,
  SemanticDomainWithSubdomains,
};

// Re-export enums from backend models.
export { State };

// Define frontend classes on backend models.

export class SemanticDomain implements ISemanticDomain {
  id: string;
  name: string;
  description = ""; // Only  used in the backend.

  constructor(id?: string, name?: string) {
    this.id = id ?? "";
    this.name = name ?? "";
  }
}

export class Sense implements ISense {
  guid: string;
  glosses: Gloss[] = [];
  semanticDomains: SemanticDomain[] = [];
  accessibility = State.Active;

  constructor(gloss?: string, lang?: string, semDom?: SemanticDomain) {
    this.guid = v4();
    if (gloss) {
      this.glosses.push({ def: gloss, language: lang ?? "" });
    }
    if (semDom) {
      this.semanticDomains.push(semDom);
    }
  }
}

export class Note implements INote {
  language: string; // bcp-47 code
  text: string;

  constructor(text: string = "", lang: string = "") {
    this.text = text;
    this.language = lang;
  }
}

export class Word implements IWord {
  id: string = "";
  guid: string;
  vernacular: string = "";
  plural: string = "";
  senses: Sense[] = [];
  audio: string[] = [];
  created: string = "";
  modified: string = "";
  accessibility: State = State.Active;
  history: string[] = [];
  partOfSpeech: string = "";
  editedBy: string[] = [];
  otherField: string = "";
  projectId: string = "";
  note: Note = new Note();

  constructor() {
    this.guid = v4();
  }
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
    ...new Word(),
    id: randomIntString(),
    vernacular: vern,
    senses: [new Sense(gloss)],
  };
}

export function multiSenseWord(vern: string, glosses: string[]): Word {
  return {
    ...new Word(),
    id: randomIntString(),
    vernacular: vern,
    senses: glosses.map((gloss) => new Sense(gloss)),
  };
}

// Used for unit testing, as the expected result, when the guids don't matter.
export function multiSenseWordAnyGuid(vern: string, glosses: string[]): Word {
  return {
    ...new Word(),
    id: randomIntString(),
    guid: expect.any(String),
    vernacular: vern,
    senses: glosses.map((gloss) => ({
      ...new Sense(gloss),
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
  return langs.map(
    (language) =>
      ({
        def: nonemptyGlosses
          .filter((g) => g.language === language)
          .map((g) => g.def)
          .join(", "),
        language,
      } as Gloss)
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
