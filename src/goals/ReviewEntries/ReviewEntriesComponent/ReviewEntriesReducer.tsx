import { StoreAction, StoreActions } from "rootActions";
import {
  ReviewEntriesAction,
  ReviewEntriesActionTypes,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import {
  OLD_SENSE,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

export interface ReviewEntriesState {
  words: ReviewEntriesWord[];
  analysisLanguage: string;
  isRecording: boolean;
  wordBeingRecorded: string | undefined;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  analysisLanguage: "en",
  isRecording: false,
  wordBeingRecorded: undefined,
};

export const reviewEntriesReducer = (
  state: ReviewEntriesState = defaultState, //createStore() calls each reducer with undefined state
  action: ReviewEntriesAction | StoreAction
): ReviewEntriesState => {
  switch (action.type) {
    case ReviewEntriesActionTypes.SetAnalysisLanguage:
      // Sets the analysis language
      return {
        ...state,
        analysisLanguage: action.analysisLanguage,
      };

    case ReviewEntriesActionTypes.UpdateAllWords:
      // Update the local words
      return {
        ...state,
        words: action.words,
      };

    case ReviewEntriesActionTypes.UpdateWord:
      // Update the specified word's IDs and data
      const newState = { ...state };
      const updateIndex = newState.words.findIndex((w) => w.id === action.id);
      newState.words[updateIndex] = {
        ...action.newWord,
        id: action.newId,
        vernacular: action.newWord.vernacular,
        senses: action.newWord.senses.map((sense) => ({
          ...sense,
          senseId: sense.senseId + OLD_SENSE,
        })),
      };
      return newState;

    case ReviewEntriesActionTypes.ClearReviewEntriesState:
      return defaultState;

    case StoreActions.RESET:
      return defaultState;

    default:
      return state;
  }
};
