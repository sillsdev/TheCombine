import { ViewFinalWord, OLD_SENSE } from "./ViewFinalComponent";
import { ViewFinalAction, ViewFinalActionTypes } from "./ViewFinalActions";

export interface ViewFinalState {
  words: ViewFinalWord[];
  language: string;
}

export const defaultState: ViewFinalState = {
  words: [],
  language: "en"
};

export const viewFinalReducer = (
  state: ViewFinalState = defaultState, //createStore() calls each reducer with undefined state
  action: ViewFinalAction
): ViewFinalState => {
  switch (action.type) {
    case ViewFinalActionTypes.UpdateAllWords:
      // Update the local words
      return {
        ...state,
        words: action.words
      };

    case ViewFinalActionTypes.UpdateWord:
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
