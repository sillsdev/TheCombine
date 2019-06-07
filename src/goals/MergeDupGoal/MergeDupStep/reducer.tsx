import {
  MergeAction,
  APPLY_MERGES,
  ADD_PARENT,
  ADD_SENSE,
  ADD_DUPLICATE,
  REMOVE_DUPLICATE
} from "./actions";
import { MergeDupStepProps } from "./component";

export const defaultState: MergeDupStepProps = {
  parentWords: []
};

function generateID(): number {
  return Math.floor(Math.random() * Math.pow(2, 16));
}

export const mergeDupStepReducer = (
  state: MergeDupStepProps | undefined, //createStore() calls each reducer with undefined state
  action: MergeAction
): MergeDupStepProps => {
  //console.log('reducer reached');
  if (!state) return defaultState;
  switch (action.type) {
    case ADD_PARENT:
      var parentWords = state.parentWords;
      var word = action.payload.merge;
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
      var { merge, parent } = action.payload;
      if (parent) {
      }
      parentWords = parentWords.map(item => {
        if (item.id == parent) {
          item.senses.push({
            id: generateID(),
            dups: [merge]
          });
        }
        return item;
      });
      return {
        ...state,
        parentWords
      };
    case ADD_DUPLICATE:
      var { merge, parent } = action.payload;
      //merge.modified = Date.now().toString();
      var parentWords = state.parentWords;
      parentWords = parentWords.map(item => {
        item.senses = item.senses.map(item => {
          if (item.id == parent) {
            item.dups.push(merge);
          }
          return item;
        });
        return item;
      });
      return { ...state, parentWords };
    case REMOVE_DUPLICATE:
      var { merge, parent: root } = action.payload;
      var parentWords = state.parentWords;

      parentWords = parentWords.map(parent => {
        parent.senses = parent.senses.map(sense => {
          if (sense.id == root) {
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
      return {
        ...state,
        parentWords: []
      };
    default:
      return state;
  }
};
