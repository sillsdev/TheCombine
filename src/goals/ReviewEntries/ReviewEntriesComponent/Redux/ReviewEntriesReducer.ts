import {
  defaultState,
  ReviewEntriesAction,
  ReviewEntriesActionTypes,
  ReviewEntriesState,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const reviewEntriesReducer = (
  state: ReviewEntriesState = defaultState, //createStore() calls each reducer with undefined state
  action: ReviewEntriesAction | StoreAction
): ReviewEntriesState => {
  switch (action.type) {
    case ReviewEntriesActionTypes.UpdateAllWords:
      // Update the local words
      return {
        ...state,
        words: action.words,
      };

    case ReviewEntriesActionTypes.UpdateWord:
      // Update the word of specified id
      return {
        ...state,
        words: state.words.map((w) =>
          w.id === action.oldId ? action.updatedWord : w
        ),
      };

    case ReviewEntriesActionTypes.ClearReviewEntriesState:
      return defaultState;

    case StoreActionTypes.RESET:
      return defaultState;

    default:
      return state;
  }
};
