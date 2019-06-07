import {
  MergeAction,
  APPLY_MERGES,
  ADD_PARENT,
  ADD_SENSE,
  ADD_DUPLICATE
} from "./actions";
import { WebkitBorderBeforeWidthProperty } from "csstype";
import { MergeDupStepState, MergeDupStepProps } from "./component";
import { arrowFunctionExpression } from "@babel/types";

export const defaultState: MergeDupStepProps = {
  parentWords: []
};

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
      parentWords.push({ word, senses: [{ parent: word, dups: [word] }] });
      return {
        ...state,
        parentWords
      };
    case ADD_SENSE:
      var parentWords = state.parentWords;
      var { merge, parent } = action.payload;
      if (parent) {
        console.log(
          "Trying to add sense {" + merge.gloss + "} to " + parent.vernacular
        );
      }
      parentWords = parentWords.map(item => {
        if (item.word == parent) {
          console.log("Found : " + item.word.vernacular);
          item.senses.push({
            parent: merge,
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
      var parentWords = state.parentWords;
      parentWords = parentWords.map(item => {
        item.senses = item.senses.map(item => {
          if (item.parent == parent) {
            item.dups.push(merge);
          }
          return item;
        });
        return item;
      });
      console.log(parentWords);
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
