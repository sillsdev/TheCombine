import { reviewEntriesReducer } from "goals/ReviewEntries/Redux/ReviewEntriesReducer";
import {
  defaultState,
  ReviewEntriesActionTypes,
} from "goals/ReviewEntries/Redux/ReviewEntriesReduxTypes";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";

describe("ReviewEntriesReducer", () => {
  it("Returns default state when passed undefined state", () => {
    expect(reviewEntriesReducer(undefined, { type: undefined } as any)).toEqual(
      defaultState
    );
  });

  it("Adds a set of words to a list when passed an UpdateAllWords action", () => {
    const revWords = [new ReviewEntriesWord(), new ReviewEntriesWord()];
    const state = reviewEntriesReducer(defaultState, {
      type: ReviewEntriesActionTypes.UpdateAllWords,
      words: revWords,
    });
    expect(state).toEqual({ ...defaultState, words: revWords });
  });

  it("Updates a specified word when passed an UpdateWord action", () => {
    const oldId = "id-of-word-to-be-updated";
    const oldWords: ReviewEntriesWord[] = [
      { ...new ReviewEntriesWord(), id: "other-id" },
      { ...new ReviewEntriesWord(), id: oldId, vernacular: "old-vern" },
    ];
    const oldState = { ...defaultState, words: oldWords };

    const newId = "id-after-update";
    const newRevWord: ReviewEntriesWord = {
      ...new ReviewEntriesWord(),
      id: newId,
      vernacular: "new-vern",
      senses: [{ ...new ReviewEntriesSense(), guid: "new-sense-id" }],
    };
    const newWords = [oldWords[0], newRevWord];

    const newState = reviewEntriesReducer(oldState, {
      type: ReviewEntriesActionTypes.UpdateWord,
      oldId,
      updatedWord: newRevWord,
    });
    expect(newState).toEqual({ ...oldState, words: newWords });
  });
});
