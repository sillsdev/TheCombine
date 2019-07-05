import { combineReducers, Reducer } from "redux";
import draggableWordReducer, {
  WordDragState
} from "../../components/DraggableWord/reducer";
import mergeStepReducer, {
  MergeTreeState
} from "./MergeDupStep/MergeDupStepReducer";

export interface MergeDuplicateState {
  mergeTreeState: MergeTreeState;
  wordDragState: WordDragState;
}

export const mergeDuplicateReducer: Reducer<
  MergeDuplicateState
> = combineReducers<MergeDuplicateState>({
  mergeTreeState: mergeStepReducer,
  wordDragState: draggableWordReducer
});

export default mergeDuplicateReducer;
