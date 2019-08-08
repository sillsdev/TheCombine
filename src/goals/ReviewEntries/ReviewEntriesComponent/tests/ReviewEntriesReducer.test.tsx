import { reviewEntriesReducer, defaultState } from "../ReviewEntriesReducer";
import { OLD_SENSE } from "../ReviewEntriesTypes";
import { ReviewEntriesActionTypes } from "../ReviewEntriesActions";
import mockWords from "./MockWords";

const newWord = {
  id: mockWords[0].id,
  vernacular: "toadTOAD",
  senses: [
    {
      senseId: "1",
      glosses: "bupBUP",
      domains: [
        { name: "domain", id: "number" },
        { name: "domain2", id: "number2" }
      ],
      deleted: false
    }
  ]
};
const result = {
  id: "a new mock id",
  vernacular: "toadTOAD",
  senses: [
    {
      senseId: "1" + OLD_SENSE,
      glosses: "bupBUP",
      domains: [
        { name: "domain", id: "number" },
        { name: "domain2", id: "number2" }
      ],
      deleted: false
    }
  ]
};
const mockState = {
  ...defaultState,
  words: mockWords
};

describe("Test ReviewEntriesReducer", () => {
  it("Returns default state when passed undefined state", () => {
    expect(reviewEntriesReducer(undefined, { type: undefined } as any)).toEqual(
      defaultState
    );
  });

  it("Adds a set of words to a list when passed an UpdateAllWords action", () => {
    expect(
      reviewEntriesReducer(defaultState, {
        type: ReviewEntriesActionTypes.UpdateAllWords,
        words: mockWords
      })
    ).toEqual(mockState);
  });

  it("Updates a specified word when passed an UpdateWord action", () => {
    expect(
      reviewEntriesReducer(mockState, {
        type: ReviewEntriesActionTypes.UpdateWord,
        id: mockWords[0].id,
        newId: result.id,
        newWord: newWord
      })
    ).toEqual({ ...mockState, words: [result, mockWords[1]] });
  });
});
