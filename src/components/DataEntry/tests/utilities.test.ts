import { Status, Word } from "api/models";
import {
  filterWordsByDomain,
  filterWordsWithSenses,
} from "components/DataEntry/utilities";
import { newSemanticDomain } from "types/semanticDomain";
import { DomainWord, newSense, simpleWord } from "types/word";

const mockWord = simpleWord("vern", "gloss");

describe("DataEntryComponent", () => {
  describe("filterWordsWithSenses", () => {
    it("returns empty Word Array when given empty Word Array.", () => {
      const words: Word[] = [];
      const expectedWords: Word[] = [];
      expect(filterWordsWithSenses(words)).toEqual(expectedWords);
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
      expect(filterWordsWithSenses(words)).toHaveLength(0);
    });

    it("keeps words with an Active/Protected sense.", () => {
      const words: Word[] = [
        mockWord,
        {
          ...mockWord,
          senses: [{ ...newSense(), accessibility: Status.Protected }],
        },
      ];
      expect(filterWordsWithSenses(words)).toHaveLength(2);
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
});
