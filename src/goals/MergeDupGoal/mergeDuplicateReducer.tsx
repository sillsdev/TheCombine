import { combineReducers, Reducer } from "redux";
import mergeStepReducer, {
  MergeTreeState,
} from "./MergeDupStep/MergeDupStepReducer";

export interface MergeDuplicateState {
  mergeTreeState: MergeTreeState;
}

export const mergeDuplicateReducer: Reducer<MergeDuplicateState> = combineReducers<
  MergeDuplicateState
>({
  mergeTreeState: mergeStepReducer,
});

export default mergeDuplicateReducer;
