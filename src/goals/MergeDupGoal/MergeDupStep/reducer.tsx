import {
  MergeTreeAction,
  ADD_PARENT,
  ADD_SENSE,
  ADD_DUPLICATE,
  REMOVE_DUPLICATE,
  CLEAR_MERGES
} from "./actions";
import { MergeDupStepProps, ParentWord } from "./component";

export const defaultState: MergeTreeState = {
  parentWords: []
};

export interface MergeTreeState {
  parentWords: ParentWord[];
}

//ID assigned to parents as senses to help differentiate between them.
function generateID(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export const mergeDupStepReducer = (
  state: MergeTreeState | undefined, //createStore() calls each reducer with undefined state
  action: MergeTreeAction
): MergeTreeState => {
  if (!state) return defaultState;
  switch (action.type) {
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
    case CLEAR_MERGES:
      return {
        ...state,
        parentWords: []
      };
    default:
      return state;
  }
};
