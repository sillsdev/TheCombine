import { ReviewEntriesWord, OLD_SENSE } from "./ReviewEntriesTypes";
import {
  ReviewEntriesAction,
  ReviewEntriesActionTypes,
} from "./ReviewEntriesActions";

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
  action: ReviewEntriesAction
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
      return {
        ...state,
        words: state.words.map((word) => {
          if (word.id === action.id) {
            return {
              ...action.newWord,
              id: action.newId,
              vernacular: action.newWord.vernacular,
              senses: action.newWord.senses.map((sense) => ({
                ...sense,
                senseId: sense.senseId + OLD_SENSE,
              })),
            };
          } else return word;
        }),
      };

    case ReviewEntriesActionTypes.ClearReviewEntriesState:
      return {
        ...defaultState,
      };

    default:
      return state;
  }
};
