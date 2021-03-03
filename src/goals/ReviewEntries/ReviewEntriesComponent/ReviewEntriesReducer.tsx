import {
  ReviewEntriesAction,
  ReviewEntriesActionTypes,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreAction, StoreActions } from "rootActions";

export interface ReviewEntriesState {
  words: ReviewEntriesWord[];
  isRecording: boolean;
  wordBeingRecorded: string | undefined;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  isRecording: false,
  wordBeingRecorded: undefined,
};

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
          w.id === action.oldId ? action.newWord : w
        ),
      };

    case ReviewEntriesActionTypes.ClearReviewEntriesState:
      return defaultState;

    case StoreActions.RESET:
      return defaultState;

    default:
      return state;
  }
};
