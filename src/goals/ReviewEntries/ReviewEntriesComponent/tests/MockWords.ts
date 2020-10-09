import { makeNote, Sense, State, Word } from "../../../../types/word";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
  SEP_CHAR,
} from "../ReviewEntriesTypes";

export const mockWords: ReviewEntriesWord[] = [
  {
    id: "0",
    vernacular: "toad",
    pronunciationFiles: [],
    senses: [
      {
        senseId: "1",
        glosses: "bup, AHHHHHH",
        domains: [{ name: "domain", id: "number" }],
        deleted: false,
      },
    ],
    noteText: "",
  },
  {
    id: "1",
    vernacular: "vern",
    pronunciationFiles: [],
    senses: [
      {
        senseId: "2",
        glosses: "gloss",
        domains: [{ name: "domain", id: "number" }],
        deleted: false,
      },
    ],
    noteText: "",
  },
];

export function mockCreateWord(
  word: ReviewEntriesWord,
  language: string
): Word {
  return {
    id: word.id,
    vernacular: word.vernacular,
    senses: word.senses.map((sense) => createMockSense(sense, language)),
    audio: [],
    created: "",
    modified: "",
    history: [],
    partOfSpeech: "",
    editedBy: [],
    otherField: "",
    plural: "",
    note: makeNote(word.noteText),
  };
}

export function createMockSense(
  sense: ReviewEntriesSense,
  language: string
): Sense {
  return {
    glosses: sense.glosses
      .split(SEP_CHAR)
      .map((value: any) => ({ def: value.trim(), language })),
    semanticDomains: sense.domains,
    accessibility: State.Active,
  };
}

export default mockWords;
