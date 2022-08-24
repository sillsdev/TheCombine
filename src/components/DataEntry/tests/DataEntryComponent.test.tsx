import { State, Word } from "api/models";
import {
  filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "components/DataEntry/DataEntryComponent";
import { TreeSemanticDomain } from "types/semanticDomain";
import { DomainWord, newSense, simpleWord } from "types/word";

const mockWord = simpleWord("vern", "gloss");

describe("DataEntryComponent", () => {
  describe("filterWords", () => {
    it("returns empty Word Array when given empty Word Array.", () => {
      const words: Word[] = [];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("removes words that aren't Active.", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: State.Deleted }],
        },
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: State.Duplicate }],
        },
      ];
      expect(filterWords(words)).toHaveLength(0);
    });

    it("keeps words that are Active.", () => {
      expect(filterWords([mockWord, mockWord])).toHaveLength(2);
    });
  });

  describe("filterWordsByDomain", () => {
    it("filters out words that do not match desired domain.", () => {
      const mockDomains = [
        new TreeSemanticDomain("ID_one", "daily"),
        new TreeSemanticDomain("ID_two", "weather"),
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
        filterWordsByDomain(unfilteredWords, mockDomains[1])
      ).toStrictEqual([new DomainWord(expectedWord, senseIndex)]);
    });
  });

  describe("sortDomainWordByVern", () => {
    it("sorts words alphabetically.", () => {
      const mockDomain = new TreeSemanticDomain("ID_one", "daily");
      const unfilteredWords: Word[] = [
        { ...mockWord },
        { ...mockWord },
        { ...mockWord },
      ];

      for (const currentWord of unfilteredWords) {
        currentWord.senses[0].semanticDomains[0] = mockDomain;
      }
      unfilteredWords[0].vernacular = "Always";
      unfilteredWords[1].vernacular = "Be";
      unfilteredWords[2].vernacular = "?character";

      const filteredDomainWords = unfilteredWords.map((w) => new DomainWord(w));
      const expectedList = [
        filteredDomainWords[2],
        filteredDomainWords[0],
        filteredDomainWords[1],
      ];
      expect(sortDomainWordByVern(unfilteredWords, mockDomain)).toStrictEqual(
        expectedList
      );
    });
  });
});
