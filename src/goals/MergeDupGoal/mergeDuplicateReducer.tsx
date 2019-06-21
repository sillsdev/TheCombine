import mergeStepReducer, { MergeTreeState } from "./MergeDupStep/reducer";
import wordListReducer, {
  WordListState
} from "./MergeDupStep/WordList/reducer";
import draggableWordReducer, {
  WordDragState
} from "../../components/DraggableWord/reducer";

import * as mergeStepActions from "./MergeDupStep/actions";
import * as wordListActions from "./MergeDupStep/WordList/actions";
import * as draggableWordActions from "../../components/DraggableWord/actions";

import { MergeDuplicateAction } from "./mergeDuplicateActions";

export interface MergeDuplicateState {
  mergeTreeState: MergeTreeState;
  wordListState: WordListState;
  wordDragState: WordDragState;
}

export const defaultState = (
  action: MergeDuplicateAction
): MergeDuplicateState => {
  return {
    mergeTreeState: mergeStepReducer(
      undefined,
      action as mergeStepActions.MergeTreeAction
    ),
    wordListState: wordListReducer(
      undefined,
      action as wordListActions.WordListAction
    ),
    wordDragState: draggableWordReducer(
      undefined,
      action as draggableWordActions.WordDragAction
    )
  };
};

export const mergeDuplicateReducer = (
  state: MergeDuplicateState,
  action: MergeDuplicateAction
): MergeDuplicateState => {
  if (!state) return defaultState(action);
  switch (action.type) {
    case mergeStepActions.MERGE_DUPLICATE_STEP_GENERIC:
      return {
        ...state,
        mergeTreeState: mergeStepReducer(
          state.mergeTreeState,
          action as mergeStepActions.MergeTreeAction
        )
      };
    case wordListActions.WORD_LIST_GENERIC:
      return {
        ...state,
        wordListState: wordListReducer(
          state.wordListState,
          action as wordListActions.WordListAction
        )
      };
    case draggableWordActions.DRAGGABLE_WORD_GENERIC:
      return {
        ...state,
        wordDragState: draggableWordReducer(
          state.wordDragState,
          action as draggableWordActions.WordDragAction
        )
      };
    default:
      return state;
  }
};

export default mergeDuplicateReducer;
