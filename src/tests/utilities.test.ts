import * as utilities from "utilities";

describe("utilities", () => {
  describe("quicksort", () => {
    const compareItem = (input: number) => {
      return input;
    };

    const numbers: number[] = [];
    for (let i = 0; i < 25; i++) numbers.push(Math.random());

    it("orders properly", () => {
      const sortedNums = utilities.quicksort<number>(numbers, compareItem);
      for (let i = 1; i < sortedNums.length; i++)
        expect(sortedNums[i - 1]).toBeLessThanOrEqual(sortedNums[i]);
    });
  });

  describe("getNowDateTimeString", () => {
    // This tests will fail intermittently if there is a bug with the 0-prepend
    it("returns string of correct length", () => {
      const expectedLength = "YYYY-MM-DD_hh-mm-ss".length;
      expect(utilities.getNowDateTimeString().length).toBe(expectedLength);
    });
  });

  describe("LevenshteinDistance", () => {
    let finder: utilities.LevenshteinDistance;
    const testParams: utilities.LevenshteinDistParams = {
      delCost: 3,
      insCost: 4,
      subCost: 5,
    };

    beforeEach(() => {
      finder = new utilities.LevenshteinDistance(testParams);
    });

    describe("getDistance", () => {
      const baseWord = "testing";

      test("with empty word", () => {
        expect(finder.getDistance("", "")).toEqual(0);
        expect(finder.getDistance(baseWord, "")).toEqual(
          baseWord.length * testParams.delCost
        );
        expect(finder.getDistance("", baseWord)).toEqual(
          baseWord.length * testParams.insCost
        );
      });

      const similarCases: [string, string, number][] = [
        ["same word", baseWord, 0],
        ["1 deletion", "testin", testParams.delCost],
        ["1 insertion", "testings", testParams.insCost],
        ["1 substitution", "tasting", testParams.subCost],
        ["2 substitutions", "tossing", 2 * testParams.subCost],
        [
          "1 insertion, 1 deletion",
          "teasing",
          testParams.insCost + testParams.delCost,
        ],
        [
          "1 insertion, 1 substitution",
          "toasting",
          testParams.insCost + testParams.subCost,
        ],
      ];
      test.each(similarCases)(
        "with similar word: %p",
        (_description: string, secondWord: string, expectedDist: number) => {
          expect(finder.getDistance(baseWord, secondWord)).toEqual(
            expectedDist
          );
        }
      );

      test("with much different words", () => {
        const diffWord = "QQQ";
        expect(finder.getDistance(diffWord, baseWord)).toEqual(
          diffWord.length * testParams.subCost +
            (baseWord.length - diffWord.length) * testParams.insCost
        );
        expect(finder.getDistance(baseWord, diffWord)).toEqual(
          diffWord.length * testParams.subCost +
            (baseWord.length - diffWord.length) * testParams.delCost
        );
      });
    });
  });
});
