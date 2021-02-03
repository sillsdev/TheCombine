import * as utilities from "utilities";

describe("utilities", () => {
  describe("quicksort", () => {
    const compareItem = (input: number) => {
      return input;
    };

    let numbers: number[] = [];
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
});
