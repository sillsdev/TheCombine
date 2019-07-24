import { ViewFinalWord, OLD_SENSE } from "./ViewFinalComponent";
import { ViewFinalAction, ViewFinalActionTypes } from "./ViewFinalActions";

export interface ViewFinalState {
  words: ViewFinalWord[];
  edits: string[];
  language: string;
}

const defaultState: ViewFinalState = {
  words: [],
  edits: [],
  language: "en"
};

export const viewFinalReducer = (
  state: ViewFinalState = defaultState, //createStore() calls each reducer with undefined state
  action: ViewFinalAction
): ViewFinalState => {
  let words: ViewFinalWord[];
  switch (action.type) {
    // Update the local words
    case ViewFinalActionTypes.UpdateAllWords:
      return {
        ...state,
        words: action.payload.words
      };

    // Update the id of a specified word
    case ViewFinalActionTypes.UpdateWord:
      return {
        ...state,
        words: state.words.map(word => {
          if (word.id === action.payload.id) {
            words = [action.payload.newWord ? action.payload.newWord : word];
            return {
              ...words[0],
              id: action.payload.id,
              senses: words[0].senses.map(sense => {
                return {
                  ...sense,
                  senseId: sense.senseId + OLD_SENSE
                };
              })
            };
          } else return word;
        })
      };

    default:
      return state;
  }
};
