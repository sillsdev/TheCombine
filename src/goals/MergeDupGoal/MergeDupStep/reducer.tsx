import { MergeAction, CLEAR_MERGES } from "./actions";
import { ADD_MERGE, UPDATE_MERGE } from "./actions";
import { WebkitBorderBeforeWidthProperty } from "csstype";
import { MergeDupStepState, MergeDupStepProps } from "./component";
import { arrowFunctionExpression } from "@babel/types";

export const defaultState: MergeDupStepProps = {
  merges: []
};

export const mergeDupStepReducer = (
  state: MergeDupStepProps | undefined, //createStore() calls each reducer with undefined state
  action: MergeAction
): MergeDupStepProps => {
  //console.log('reducer reached');
  if (!state) return defaultState;
  switch (action.type) {
    case ADD_MERGE:
      var merges = state.merges;
      merges.push([action.payload.merge]);
      return { ...state, merges };
    case UPDATE_MERGE:
      return {
        ...state,
        merges: state.merges.map(item => {
          if (item == action.payload.parent) {
            item.push(action.payload.merge);
          }
          return item;
        })
      };
    case CLEAR_MERGES:
      return {
        ...state,
        merges: []
      };
    default:
      return state;
  }
};
