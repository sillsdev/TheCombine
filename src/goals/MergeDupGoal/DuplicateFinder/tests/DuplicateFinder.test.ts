import DupFinder, {
  DefaultParams,
} from "goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { simpleWord, testWordList } from "types/word";

jest.mock("backend", () => {
  return {
    getFrontierWords: () => mockGetFrontierWords(),
  };
});

let finder: DupFinder;
const mockGetFrontierWords = jest.fn();

beforeEach(() => {
  finder = new DupFinder();
  mockGetFrontierWords.mockResolvedValue(testWordList());
});

describe("dupFinder", () => {
  test("getNextDups returns correct number of word collections", async () => {
    await finder.getNextDups().then((wordCollections) => {
      expect(wordCollections.length).toBeLessThanOrEqual(7);
    });
  });

  test("fetchWordsFromDB can get words from frontier", async () => {
    expect(finder.maskedWords.length).toBe(0);

    await finder.fetchWordsFromDB().then((gotWords) => {
      expect(gotWords).toBe(true);
      expect(finder.maskedWords.length).toBe(testWordList().length);
    });
  });

  test("getDuplicatesOfWord search for duplicates with one parent", async () => {
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
      expect(finder.getLevenshteinDistance("testing", "testing")).toEqual(0);
    });

    test("with similar Word, one insertion and one substitution", () => {
      expect(finder.getLevenshteinDistance("testing", "toasting")).toEqual(3);
    });

    test("with single substitution", () => {
      expect(finder.getLevenshteinDistance("testing", "tasting")).toEqual(
        DefaultParams.subCost
      );
    });

    test("with single deletion", () => {
      expect(finder.getLevenshteinDistance("testin", "testing")).toEqual(
        DefaultParams.delCost
      );
    });

    test("with single addition", () => {
      expect(finder.getLevenshteinDistance("testing", "testin")).toEqual(
        DefaultParams.insCost
      );
    });

    test("with distinct Word", () => {
      expect(
        finder.getLevenshteinDistance(
          "badger",
          "testWordList[12].senses[0].glosses[0].def"
        )
      ).toEqual(39);
    });
  });
});
