import { Sense, Word } from "api/models";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import {
  newFlag,
  newNote,
  newSemanticDomain,
  newSense,
  newWord,
} from "types/word";
import { langCode } from "types/writingSystem";

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
            { def: "bup", language: langCode.En },
            { def: "AHHHHHH", language: langCode.Es },
          ],
          domains: [newSemanticDomain("number", "domain")],
          deleted: false,
        },
      ],
      noteText: "first word",
    },
    {
      ...new ReviewEntriesWord(),
      id: "1",
      vernacular: "vern",
      senses: [
        {
          guid: "2",
          definitions: [],
          glosses: [{ def: "gloss", language: langCode.En }],
          domains: [newSemanticDomain("number", "domain")],
          deleted: false,
        },
      ],
      flag: newFlag("second word"),
    },
  ];
}

export function mockCreateWord(word: ReviewEntriesWord): Word {
  return {
    ...newWord(word.vernacular),
    id: word.id,
    senses: word.senses.map((sense) => createMockSense(sense)),
    note: newNote(word.noteText),
    flag: word.flag,
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
