import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { Note, Sense, State, Word } from "types/word";

export const mockWords: ReviewEntriesWord[] = [
  {
    ...new ReviewEntriesWord(),
    id: "0",
    vernacular: "toad",
    senses: [
      {
        senseId: "1",
        glosses: [
          { def: "bup", language: "en" },
          { def: "AHHHHHH", language: "en" },
        ],
        domains: [{ name: "domain", id: "number" }],
        deleted: false,
      },
    ],
  },
  {
    ...new ReviewEntriesWord(),
    id: "1",
    vernacular: "vern",
    senses: [
      {
        senseId: "2",
        glosses: [{ def: "gloss", language: "en" }],
        domains: [{ name: "domain", id: "number" }],
        deleted: false,
      },
    ],
  },
];

export function mockCreateWord(word: ReviewEntriesWord): Word {
  return {
    ...new Word(),
    id: word.id,
    vernacular: word.vernacular,
    senses: word.senses.map((sense) => createMockSense(sense)),
    note: new Note(word.noteText),
  };
}

function createMockSense(sense: ReviewEntriesSense): Sense {
  return {
    glosses: [...sense.glosses],
    semanticDomains: [...sense.domains],
    accessibility: State.Active,
  };
}

export default mockWords;
