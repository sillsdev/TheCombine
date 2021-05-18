import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { Note, SemanticDomain, Sense, State, Word } from "types/word";

export default function mockWords(): ReviewEntriesWord[] {
  return [
    {
      ...new ReviewEntriesWord(),
      id: "0",
      vernacular: "toad",
      senses: [
        {
          guid: "1",
          glosses: [
            { def: "bup", language: "en" },
            { def: "AHHHHHH", language: "es" },
          ],
          domains: [new SemanticDomain("number", "domain")],
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
          guid: "2",
          glosses: [{ def: "gloss", language: "en" }],
          domains: [new SemanticDomain("number", "domain")],
          deleted: false,
        },
      ],
    },
  ];
}

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
    guid: sense.guid,
    glosses: [...sense.glosses],
    semanticDomains: [...sense.domains],
    accessibility: State.Active,
  };
}
