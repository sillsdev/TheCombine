import mergeStepReducer, { MergeTreeState } from "./MergeDupStep/reducer";
import wordListReducer, {
  WordListState
} from "./MergeDupStep/WordList/reducer";
import draggableWordReducer, {
  WordDragState
} from "../../components/DraggableWord/reducer";

import { Reducer } from "redux";
import { combineReducers } from "redux";

export interface MergeDuplicateState {
  mergeTreeState: MergeTreeState;
  wordListState: WordListState;
  wordDragState: WordDragState;
}

export const mergeDuplicateReducer: Reducer<
  MergeDuplicateState
> = combineReducers<MergeDuplicateState>({
  mergeTreeState: mergeStepReducer,
  wordDragState: draggableWordReducer,
  wordListState: wordListReducer
});

export default mergeDuplicateReducer;
