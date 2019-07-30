import { ReviewEntriesWord, OLD_SENSE } from "./ReviewEntriesComponent";
import {
  ReviewEntriesAction,
  ReviewEntriesActionTypes
} from "./ReviewEntriesActions";

export interface ReviewEntriesState {
  words: ReviewEntriesWord[];
  language: string;
}

export const defaultState: ReviewEntriesState = {
  words: [],
  language: "en"
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
        words: action.words
      };

    case ReviewEntriesActionTypes.UpdateWord:
      // Update the specified word's IDs and data
      return {
        ...state,
        words: state.words.map(word => {
          if (word.id === action.id) {
            return {
              ...action.newWord,
              id: action.newId,
              vernacular: action.newWord.vernacular,
              senses: action.newWord.senses.map(sense => ({
                ...sense,
                senseId: sense.senseId + OLD_SENSE
              }))
            };
          } else return word;
        })
      };

    default:
      return state;
  }
};
