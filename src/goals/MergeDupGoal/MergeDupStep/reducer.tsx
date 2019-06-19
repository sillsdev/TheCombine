import {
  MergeAction,
  APPLY_MERGES,
  ADD_PARENT,
  ADD_SENSE,
  ADD_DUPLICATE,
  REMOVE_DUPLICATE,
  ADD_LIST_WORD,
  REMOVE_LIST_WORD,
  CLEAR_LIST_WORDS
} from "./actions";
import { MergeDupStepProps } from "./component";
import { State, Word } from "../../../types/word";
import * as backend from "../../../backend";

export const defaultState: MergeDupStepProps = {
  parentWords: [],
  words: []
};

//ID assigned to parents as senses to help differentiate between them.
function generateID(): number {
  return Math.floor(Math.random() * Math.pow(2, 16));
}

export const mergeDupStepReducer = (
  state: MergeDupStepProps | undefined, //createStore() calls each reducer with undefined state
  action: MergeAction
): MergeDupStepProps => {
  if (!state) return defaultState;
  switch (action.type) {
    case ADD_LIST_WORD: //_LIST_WORD actions affect the list of possible duplicates
      var words = state.words;
      words = words.concat(action.payload.word);
      return { ...state, words };
    case REMOVE_LIST_WORD:
      var words = state.words;
      // finds last matching by index
      var foundIndex = words.lastIndexOf(action.payload.word);
      // remove previously found word
      words = words.filter((_, index) => index !== foundIndex);
      return { ...state, words };
    case CLEAR_LIST_WORDS:
      return { ...state, words: [] };
    case ADD_PARENT:
      var parentWords = state.parentWords;
      var word = action.payload.word;
      parentWords.push({
        id: generateID(),
        senses: [{ id: generateID(), dups: [word] }]
      });
      return {
        ...state,
        parentWords
      };
    case ADD_SENSE:
      var parentWords = state.parentWords;
      var { word: merge, parent } = action.payload;
      if (parent) {
        parentWords = parentWords.map(item => {
          if (item.id === parent) {
            item.senses.push({
              id: generateID(),
              dups: [merge]
            });
          }
          return item;
        });
      }
      return {
        ...state,
        parentWords
      };
    case ADD_DUPLICATE:
      var { word: merge, parent } = action.payload;
      var parentWords = state.parentWords;
      parentWords = parentWords.map(item => {
        item.senses = item.senses.map(item => {
          if (item.id === parent) {
            item.dups.push(merge);
          }
          return item;
        });
        return item;
      });
      return { ...state, parentWords };
    case REMOVE_DUPLICATE:
      var { word: merge, parent: root } = action.payload;
      var parentWords = state.parentWords;

      parentWords = parentWords.map(parent => {
        parent.senses = parent.senses.map(sense => {
          if (sense.id === root) {
            sense.dups = sense.dups.filter(word => word !== merge);
          }
          return sense;
        });
        parent.senses = parent.senses.filter(sense => sense.dups.length > 0);
        return parent;
      });
      parentWords = parentWords.filter(parent => parent.senses.length > 0);

      return { ...state, parentWords };
    case APPLY_MERGES:
      state.parentWords.forEach(async parent => {
        var senses: Word[] = [];
        await Promise.all(
          parent.senses.map(async sense => {
            if (sense.dups.length > 1) {
              senses.push({
                ...sense.dups[0],
                id: await backend.mergeWords(sense.dups, State.duplicate)
              });
            } else {
              // Should never be 0
              senses.push(sense.dups[0]);
            }
          })
        );
        if (senses.length > 0) {
          backend.mergeWords(senses, State.sense);
        }
      });
      return {
        ...state,
        parentWords: []
      };
    default:
      return state;
  }
};
