import DupFinder, {
  FinderParams,
} from "goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";

let finder: DupFinder;
const testParams: FinderParams = { delCost: 3, insCost: 4, subCost: 5 };

beforeEach(() => {
  finder = new DupFinder(testParams);
});

describe("dupFinder", () => {
  describe("getLevenshteinDistance", () => {
    const baseWord: string = "testing";

    test("with same Word", () => {
      expect(finder.getLevenshteinDistance(baseWord, baseWord)).toEqual(0);
    });

    test("with similar Word, one insertion and one substitution", () => {
      expect(finder.getLevenshteinDistance(baseWord, "toasting")).toEqual(
        testParams.insCost + testParams.subCost
      );
    });

    test("with single substitution", () => {
      expect(finder.getLevenshteinDistance(baseWord, "tasting")).toEqual(
        testParams.subCost
      );
    });

    test("with single deletion", () => {
      expect(finder.getLevenshteinDistance(baseWord, "testin")).toEqual(
        testParams.delCost
      );
    });

    test("with single insertion", () => {
      expect(finder.getLevenshteinDistance(baseWord, "testings")).toEqual(
        testParams.insCost
      );
    });
  });
});
