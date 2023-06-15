import { Status, Word } from "api/models";
import {
  filterWords,
  filterWordsByDomain,
  sortDomainWordsByVern,
} from "components/DataEntry/utilities";
import { newSemanticDomain } from "types/semanticDomain";
import { DomainWord, newSense, simpleWord } from "types/word";

const mockWord = simpleWord("vern", "gloss");

describe("DataEntryComponent", () => {
  describe("filterWords", () => {
    it("returns empty Word Array when given empty Word Array.", () => {
      const words: Word[] = [];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("removes words with no Active/Protected sense.", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: Status.Deleted }],
        },
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: Status.Duplicate }],
        },
      ];
      expect(filterWords(words)).toHaveLength(0);
    });

    it("keeps words with an Active/Protected sense.", () => {
      const words: Word[] = [
        mockWord,
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: Status.Protected }],
        },
      ];
      expect(filterWords(words)).toHaveLength(2);
    });
  });

  describe("filterWordsByDomain", () => {
    it("filters out words that do not match desired domain.", () => {
      const mockDomains = [
        newSemanticDomain("ID_one", "daily"),
        newSemanticDomain("ID_two", "weather"),
      ];

      const senses = [
        newSense("inExtraDomain", "", mockDomains[0]),
        newSense("inTargetDomain", "", mockDomains[1]),
      ];

      const unfilteredWords: Word[] = [
        {
          ...mockWord,
          vernacular: "one",
          senses: [...mockWord.senses, senses[0]],
        },
        {
          ...mockWord,
          vernacular: "two",
          senses: [...mockWord.senses, senses[1]],
        },
        {
          ...mockWord,
          vernacular: "three",
          senses: [...mockWord.senses, senses[0]],
        },
      ];

      const targetDomain = mockDomains[1];
      const expectedWord = unfilteredWords[1];
      const senseIndex = expectedWord.senses.findIndex(
        (s) => s.semanticDomains[0]?.id == targetDomain.id
      );
      expect(
        filterWordsByDomain(unfilteredWords, mockDomains[1].id)
      ).toStrictEqual([new DomainWord(expectedWord, senseIndex)]);
    });
  });

  describe("sortDomainWordByVern", () => {
    it("sorts words alphabetically.", () => {
      const words = [mockWord, mockWord, mockWord].map(
        (w) => new DomainWord(w)
      );
      words[0].vernacular = "Always";
      words[1].vernacular = "Be";
      words[2].vernacular = "?character";

      const expectedList: DomainWord[] = [words[2], words[0], words[1]];
      expect(sortDomainWordsByVern([...words])).toStrictEqual(expectedList);
    });
  });
});
