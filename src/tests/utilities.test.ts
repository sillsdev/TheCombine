import * as utilities from "../utilities";

describe("test all utilities", () => {
  let compareItem = (input: any) => {
    return input as number;
  };
  let numbers: number[] = [];
  for (let i = 0; i < 25; i++) numbers.push(Math.random());

  test("the quicksort algorithm orders properly", () => {
    let sortedNums = utilities.quicksort<number>(numbers, compareItem);
    for (let i = 1; i < sortedNums.length; i++)
      expect(sortedNums[i - 1]).toBeLessThanOrEqual(sortedNums[i]);
  });
});
