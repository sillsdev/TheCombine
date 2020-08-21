import { ReviewEntriesWord, OLD_SENSE } from "./ReviewEntriesTypes";
import {
  ReviewEntriesAction,
  ReviewEntriesActionTypes,
} from "./ReviewEntriesActions";

export interface ReviewEntriesState {
  words: ReviewEntriesWord[];
  language: string;
  isRecording: boolean;
  wordBeingRecorded: string | undefined;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  language: "en",
  isRecording: false,
  wordBeingRecorded: undefined,
};

export const reviewEntriesReducer = (
  state: ReviewEntriesState = defaultState, //createStore() calls each reducer with undefined state
  action: ReviewEntriesAction
): ReviewEntriesState => {
  switch (action.type) {
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

    case ReviewEntriesActionTypes.UpdateRecordingStatus:
      // Update recording status
      return {
        ...state,
        isRecording: action.recordingStatus,
        wordBeingRecorded: action.wordId,
      };

    case ReviewEntriesActionTypes.ClearReviewEntriesState:
      return {
        ...defaultState,
      };

    default:
      return state;
  }
};
