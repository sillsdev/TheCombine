import { State } from "api";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { Sense, Word } from "types/word";

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
          domains: [{ name: "domain", id: "number", description: "" }],
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
          domains: [{ name: "domain", id: "number", description: "" }],
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
    note: { text: word.noteText, language: "" },
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
