import { reviewEntriesReducer } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import {
  defaultState,
  ReviewEntriesActionTypes,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";
import { newSemanticDomain } from "types/word";

const mockState = {
  ...defaultState,
  words: mockWords(),
};
const reviewEntriesWord: ReviewEntriesWord = {
  ...new ReviewEntriesWord(),
  id: mockState.words[0].id,
  vernacular: "toadTOAD",
  senses: [
    {
      guid: "1",
      definitions: [],
      glosses: [{ def: "bupBUP", language: "en" }],
      domains: [
        newSemanticDomain("number", "domain"),
        newSemanticDomain("number2", "domain2"),
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
      definitions: [],
      glosses: [{ def: "bupBUP", language: "en" }],
      domains: [
        newSemanticDomain("number", "domain"),
        newSemanticDomain("number2", "domain2"),
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
        updatedWord: { ...reviewEntriesWord, id: result.id },
      })
    ).toEqual({ ...mockState, words: [result, mockWords()[1]] });
  });
});
