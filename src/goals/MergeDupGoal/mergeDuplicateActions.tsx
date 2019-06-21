import * as mergeStepActions from "./MergeDupStep/actions";
import * as wordListActions from "./MergeDupStep/WordList/actions";
import * as draggableWordActions from "../../components/DraggableWord/actions";

export type MergeDuplicatePayload =
  | wordListActions.WordListPayload
  | mergeStepActions.MergeTreePayload
  | draggableWordActions.WordDragPayload;

export interface MergeDuplicateAction {
  type:
    | wordListActions.WORD_LIST_GENERIC
    | draggableWordActions.DRAGGABLE_WORD_GENERIC
    | mergeStepActions.MERGE_DUPLICATE_STEP_GENERIC;
  payload: MergeDuplicatePayload;
}
