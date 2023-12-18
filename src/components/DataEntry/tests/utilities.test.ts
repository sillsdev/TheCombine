import { Sense, Status, Word } from "api/models";
import {
  filterWordsByDomain,
  filterWordsWithSenses,
} from "components/DataEntry/utilities";
import { newSemanticDomain } from "types/semanticDomain";
import { DomainWord, newSense, simpleWord } from "types/word";

const mockWord = simpleWord("vern", "gloss");
const domainSense = (accessibility: Status, domainId?: string): Sense => {
  const semanticDomains = [newSemanticDomain(domainId)];
  return { ...newSense(), accessibility, semanticDomains };
};

describe("DataEntryComponent", () => {
  describe("filterWordsWithSenses", () => {
    it("returns empty Word Array when given empty Word Array.", () => {
      expect(filterWordsWithSenses([])).toEqual([]);
    });

    it("removes words with no Active/Protected sense.", () => {
      const words: Word[] = [
        { ...mockWord, senses: [domainSense(Status.Deleted)] },
        { ...mockWord, senses: [domainSense(Status.Duplicate)] },
      ];
      expect(filterWordsWithSenses(words)).toHaveLength(0);
    });

    it("keeps words with an Active/Protected sense.", () => {
      const words: Word[] = [
        { ...mockWord, senses: [domainSense(Status.Active)] },
        { ...mockWord, senses: [domainSense(Status.Protected)] },
      ];
      expect(filterWordsWithSenses(words)).toHaveLength(2);
    });

    it("removes words with inactive sense even in specified domain.", () => {
      const domId = "domain-id";
      const words: Word[] = [
        { ...mockWord, senses: [domainSense(Status.Deleted, domId)] },
        { ...mockWord, senses: [domainSense(Status.Duplicate, domId)] },
      ];
      expect(filterWordsWithSenses(words, domId)).toHaveLength(0);
    });

    it("removes words with sense in wrong domain.", () => {
      const words: Word[] = [
        { ...mockWord, senses: [domainSense(Status.Active, "one wrong")] },
        { ...mockWord, senses: [domainSense(Status.Protected, "other wrong")] },
      ];
      expect(filterWordsWithSenses(words, "right one")).toHaveLength(0);
    });

    it("keeps words with an Active/Protected sense in specified domain.", () => {
      const domId = "domain-id";
      const words: Word[] = [
        { ...mockWord, senses: [domainSense(Status.Active, domId)] },
        { ...mockWord, senses: [domainSense(Status.Protected, domId)] },
      ];
      expect(filterWordsWithSenses(words, domId)).toHaveLength(2);
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
