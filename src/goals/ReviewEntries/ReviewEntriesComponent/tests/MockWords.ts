import { Sense, Word } from "api/models";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newNote, newSemanticDomain, newSense, newWord } from "types/word";

export default function mockWords(): ReviewEntriesWord[] {
  return [
    {
      ...new ReviewEntriesWord(),
      id: "0",
      vernacular: "toad",
      senses: [
        {
          guid: "1",
          definitions: [],
          glosses: [
            { def: "bup", language: "en" },
            { def: "AHHHHHH", language: "es" },
          ],
          domains: [newSemanticDomain("number", "domain")],
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
          definitions: [],
          glosses: [{ def: "gloss", language: "en" }],
          domains: [newSemanticDomain("number", "domain")],
          deleted: false,
        },
      ],
    },
  ];
}

export function mockCreateWord(word: ReviewEntriesWord): Word {
  return {
    ...newWord(word.vernacular),
    id: word.id,
    senses: word.senses.map((sense) => createMockSense(sense)),
    note: newNote(word.noteText),
  };
}

function createMockSense(sense: ReviewEntriesSense): Sense {
  return {
    ...newSense(),
    guid: sense.guid,
    definitions: [...sense.definitions],
    glosses: [...sense.glosses],
    semanticDomains: [...sense.domains],
  };
}
