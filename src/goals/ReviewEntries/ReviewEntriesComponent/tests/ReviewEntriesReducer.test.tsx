import { ReviewEntriesActionTypes } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import {
  defaultState,
  reviewEntriesReducer,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const mockState = {
  ...defaultState,
  words: mockWords(),
};
const newWord: ReviewEntriesWord = {
  ...new ReviewEntriesWord(),
  id: mockState.words[0].id,
  vernacular: "toadTOAD",
  senses: [
    {
      guid: "1",
      glosses: [{ def: "bupBUP", language: "en" }],
      domains: [
        { name: "domain", id: "number" },
        { name: "domain2", id: "number2" },
      ],
      deleted: false,
    },
  ],
};
const result: ReviewEntriesWord = {
  ...new ReviewEntriesWord(),
  id: "a new mock id",
  vernacular: "toadTOAD",
  senses: [
    {
      guid: "1",
      glosses: [{ def: "bupBUP", language: "en" }],
      domains: [
        { name: "domain", id: "number" },
        { name: "domain2", id: "number2" },
      ],
      deleted: false,
    },
  ],
};

describe("ReviewEntriesReducer", () => {
  it("Returns default state when passed undefined state", () => {
    expect(reviewEntriesReducer(undefined, { type: undefined } as any)).toEqual(
      defaultState
    );
  });

  it("Adds a set of words to a list when passed an UpdateAllWords action", () => {
    expect(
      reviewEntriesReducer(defaultState, {
        type: ReviewEntriesActionTypes.UpdateAllWords,
        words: mockWords(),
      })
    ).toEqual(mockState);
  });

  it("Updates a specified word when passed an UpdateWord action", () => {
    expect(
      reviewEntriesReducer(mockState, {
        type: ReviewEntriesActionTypes.UpdateWord,
        oldId: mockWords()[0].id,
        newWord: { ...newWord, id: result.id },
      })
    ).toEqual({ ...mockState, words: [result, mockWords()[1]] });
  });
});
