//Sam Delaney, 6/12/19

import {
  simpleWord,
  testWordList as mockTestWordList,
} from "../../../../types/word";
import DupFinder, { DefaultParams } from "../DuplicateFinder";

jest.mock("../../../../backend", () => {
  return {
    getFrontierWords: jest.fn(() => {
      return Promise.resolve(mockTestWordList());
    }),
  };
});

describe("dupFinder", () => {
  test("getNextDups returns correct number of word collections", async () => {
    let finder = new DupFinder();

    await finder.getNextDups().then((wordCollections) => {
      expect(wordCollections.length).toBeLessThanOrEqual(7);
    });
  });

  test("fetchWordsFromDB can get words from frontier", async () => {
    let finder = new DupFinder();

    expect(finder.maskedWords.length).toBe(0);

    await finder.fetchWordsFromDB().then((gotWords) => {
      expect(gotWords).toBe(true);
      expect(finder.maskedWords.length).toBe(mockTestWordList().length);
    });
  });

  test("getDuplicatesOfWord search for duplicates with one parent", async () => {
    const finder = new DupFinder();

    const parent = simpleWord("Yank", "Mayonnaise");

    await finder.fetchWordsFromDB().then(() => {
      const duplicates = finder.getDuplicatesOfWord(parent);

      duplicates.forEach((duplicate) => {
        const vernScore = finder.getLevenshteinDistance(
          duplicate.vernacular,
          parent.vernacular
        );
        const glossScore =
          finder.getLevenshteinDistance(
            duplicate.senses[0].glosses[0].def,
            parent.senses[0].glosses[0].def
          ) * 3;

        expect(
          glossScore + vernScore <= DefaultParams.maxScore ||
            glossScore === 0 ||
            vernScore <= 1
        ).toBe(true);
      });
    });
  });

  describe("getLevenshteinDistance", () => {
    test("with same Word", () => {
      let finder = new DupFinder();
      expect(finder.getLevenshteinDistance("testing", "testing")).toEqual(0);
    });

    test("with similar Word, one insertion and one substitution", () => {
      let finder = new DupFinder();
      expect(finder.getLevenshteinDistance("testing", "toasting")).toEqual(3);
    });

    test("with single substitution", () => {
      let finder = new DupFinder();
      expect(finder.getLevenshteinDistance("testing", "tasting")).toEqual(
        DefaultParams.subCost
      );
    });

    test("with single deletion", () => {
      const finder = new DupFinder();
      expect(finder.getLevenshteinDistance("testin", "testing")).toEqual(
        DefaultParams.delCost
      );
    });

    test("with single addition", () => {
      const finder = new DupFinder();
      expect(finder.getLevenshteinDistance("testing", "testin")).toEqual(
        DefaultParams.insCost
      );
    });

    test("with distinct Word", () => {
      const finder = new DupFinder();
      expect(
        finder.getLevenshteinDistance(
          "badger",
          "testWordList[12].senses[0].glosses[0].def"
        )
      ).toEqual(39);
    });
  });
});
