export enum State {
  active,
  deleted,
  sense,
  duplicate
}

export interface Word {
  id: string;
  vernacular: string;
  senses: string[];
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

export interface Merge {
  parent: string;
  children: string[];
  mergeType: State;
  time: string;
}

export function hasSenses(word: Word) {
  return word.senses && word.senses.length > 0;
}

export function simpleWord(vern: string, gloss: string): Word {
  return {
    id: Math.floor(Math.random() * 9999999).toString(),
    vernacular: vern,
    senses: [gloss],
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
    simpleWord("Yuino", "Love"),
    simpleWord("Yuino", "Boba Fett"),
    simpleWord("Yes", "Wumbo"),
    simpleWord("Yes", "Mayonnaise")
  ];
}
