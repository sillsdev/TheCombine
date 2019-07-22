export enum State {
  active,
  deleted,
  sense,
  duplicate,
  separate
}

export interface Gloss {
  language: string;
  def: string;
}

export interface SemanticDomain {
  name: string;
  id: string;
}
export interface Sense {
  glosses: Gloss[];
  semanticDomains: SemanticDomain[];
  accessibility?: State;
}

export function makeSense(val: string) {
  return {
    glosses: [{ def: val, language: "" }],
    semanticDomains: []
  };
}

export interface Word {
  id: string;
  vernacular: string;
  senses: Sense[];
  audio: string;
  created: string;
  modified: string;
  history: string[];
  partOfSpeech: string;
  editedBy: string[];
  accessability: State;
  otherField: string;
  plural: string;
}

export interface MergeWord {
  wordID: string;
  senses: State[];
}

export interface Merge {
  parent: Word;
  children: MergeWord[];
  time: string;
}

export function hasSenses(word: Word): boolean {
  let returnval =
    word.senses &&
    word.senses.length > 0 &&
    word.senses[0].glosses &&
    word.senses[0].glosses.length > 0;
  return returnval;
}

export function simpleWord(vern: string, gloss: string): Word {
  return {
    id: Math.floor(Math.random() * 9999999).toString(),
    vernacular: vern,
    senses: [makeSense(gloss)],
    audio: "",
    created: "now",
    modified: "",
    history: [],
    partOfSpeech: "",
    editedBy: [],
    accessability: State.active,
    otherField: "",
    plural: ""
  };
}

export function multiGlossWord(vern: string, glosses: string[]) {
  return {
    id: Math.floor(Math.random() * 9999999).toString(),
    vernacular: vern,
    senses: glosses.map(gloss => makeSense(gloss)),
    audio: "",
    created: "now",
    modified: "",
    history: [],
    partOfSpeech: "",
    editedBy: [],
    accessability: State.active,
    otherField: "",
    plural: ""
  };
}

export function testWordList(): Word[] {
  return [
    simpleWord("Yoink", "Hello"),
    simpleWord("Yode", "Goodbye"),
    simpleWord("Yoff", "Yes"),
    simpleWord("Yank", "No"),
    simpleWord("Yank", "Please god help me"),
    simpleWord("Ya", "Help"),
    simpleWord("Yeet", "Please"),
    simpleWord("Yeet", "Mandatory"),
    simpleWord("Yang", "Die"),
    multiGlossWord("Yuino", ["Love", "Boba Fett", "Life"]),
    multiGlossWord("Yuilo", ["Sadness", "Tree bark"]),
    simpleWord("Yes", "Wumbo"),
    simpleWord("Yes", "Mayonnaise")
  ];
}
