import { GramCatGroup, Sense, Word } from "api/models";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newSemanticDomain } from "types/semanticDomain";
import {
  newDefinition,
  newFlag,
  newGloss,
  newNote,
  newSense,
  newWord,
} from "types/word";
import { Bcp47Code } from "types/writingSystem";

export default function mockWords(): ReviewEntriesWord[] {
  return [
    {
      ...new ReviewEntriesWord(),
      id: "0",
      vernacular: "toad",
      senses: [
        {
          ...new ReviewEntriesSense(),
          guid: "1",
          glosses: [
            newGloss("bup", Bcp47Code.En),
            newGloss("AHH", Bcp47Code.Es),
          ],
          definitions: [
            newDefinition("bup-bup", Bcp47Code.Ar),
            newDefinition("AHH-AHH", Bcp47Code.Fr),
          ],
          domains: [newSemanticDomain("number", "domain")],
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
          ...new ReviewEntriesSense(),
          guid: "2",
          glosses: [newGloss("gloss", Bcp47Code.En)],
          domains: [newSemanticDomain("number", "domain")],
          partOfSpeech: {
            catGroup: GramCatGroup.Other,
            grammaticalCategory: "wxyz",
          },
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
    grammaticalInfo: sense.partOfSpeech,
    semanticDomains: [...sense.domains],
  };
}
