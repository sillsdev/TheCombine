import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  dropWord,
  WordDragAction
} from "../../../components/DraggableWord/actions";
import { StoreState } from "../../../types";
import {
  MergeTreeAction,
  refreshWords,
  moveSenses,
  mergeAll,
  orderSense
} from "./MergeDupStepActions";
import MergeDupStepComponent from "./MergeDupStepComponent";
import { MergeTreeReference } from "./MergeDupsTree";

export function mapStateToProps(state: StoreState) {
  return {
    draggedSense: state.mergeDuplicateGoal.wordDragState.draggedWord,
    words: state.mergeDuplicateGoal.mergeTreeState.tree.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    dropWord: () => {
      dispatch(dropWord());
    },
    refreshWords: () => dispatch(refreshWords()),
    moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => {
      dispatch(moveSenses(src, dest));
    },
    orderSense: (wordID: string, senseID: string, order: number) => {
      dispatch(orderSense(wordID, senseID, order));
    },
    mergeAll: () => {
      dispatch(mergeAll());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
