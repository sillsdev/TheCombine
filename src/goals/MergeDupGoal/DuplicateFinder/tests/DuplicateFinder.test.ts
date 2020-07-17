//Sam Delaney, 6/12/19

import {
  simpleWord,
  testWordList as mockTestWordList,
  Word,
} from "../../../../types/word";
import DupFinder, { DefaultParams } from "../DuplicateFinder";

jest.mock("../../../../backend", () => {
  return {
    getFrontierWords: jest.fn(() => {
      return Promise.resolve(mockTestWordList());
    }),
  };
});

describe("dupFinder Tests", () => {
  //TEST UTILITIES

  test("getNextDups returns correct number of word collections", async () => {
    let finder = new DupFinder();

    await finder.getNextDups().then((wordCollections) => {
      expect(wordCollections.length).toBeLessThanOrEqual(7);
    });
  });

  test("finder can get words from frontier", async () => {
    let finder = new DupFinder();

    expect(finder.maskedWords.length).toBe(0);

    await finder.fetchWordsFromDB().then((gotWords) => {
      expect(gotWords).toBe(true);
      expect(finder.maskedWords.length).toBe(mockTestWordList().length);
    });
  });

  test("the finder can search for duplicates with one parent", async () => {
    let finder = new DupFinder();

    let parent = simpleWord("Yank", "Mayonnaise");

    let duplicates: [Word[], number] = [[], Number.MIN_SAFE_INTEGER];
    await finder.fetchWordsFromDB().then(() => {
      duplicates = finder.getDuplicatesOfWord(parent);

      duplicates[0].forEach((duplicate) => {
        let vernScore = finder.getLevenshteinDistance(
          duplicate.vernacular,
          parent.vernacular
        );
        let glossScore =
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

  test("Levenshtein Distance with same Word", () => {
    let finder = new DupFinder();
    expect(finder.getLevenshteinDistance("testing", "testing")).toEqual(0);
  });

  test("Levenshtein Distance with similar Word", () => {
    let finder = new DupFinder();
    //one insertion, one substitution
    expect(finder.getLevenshteinDistance("testing", "toasting")).toEqual(3);
  });

  test("Levenshtein Distance with single substitution", () => {
    let finder = new DupFinder();
    //one insertion, one substitution
    expect(finder.getLevenshteinDistance("testing", "tasting")).toEqual(
      DefaultParams.subCost
    );
  });

  test("Levenshtein Distance with single deletion", () => {
    let finder = new DupFinder();
    //one insertion, one substitution
    expect(finder.getLevenshteinDistance("testin", "testing")).toEqual(
      DefaultParams.delCost
    );
  });

  test("Levenshtein Distance with single addition", () => {
    let finder = new DupFinder();
    //one insertion, one substitution
    expect(finder.getLevenshteinDistance("testing", "testin")).toEqual(
      DefaultParams.insCost
    );
  });

  test("Levenshtein Distance with distinct Word", () => {
    let finder = new DupFinder();
    expect(
      finder.getLevenshteinDistance(
        "badger",
        "testWordList[12].senses[0].glosses[0].def"
      )
    ).toEqual(39);
  });
});
