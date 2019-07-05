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
  moveSense,
  mergeAll
} from "./MergeDupStepActions";
import MergeDupStepComponent from "./MergeDupStepComponent";
import { MergeTreeReference } from "./MergeDupsTree";

export function mapStateToProps(state: StoreState) {
  // let history: Goal[] = state.goalsState.historyState.history;
  // let currentGoal: MergeDups = history[history.length - 1];
  // let currentStep: MergeDupStepProps = currentGoal.steps[currentGoal.curNdx];

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
    refreshWords: () => {
      dispatch(refreshWords());
    },
    moveSense: (src: MergeTreeReference, dest: MergeTreeReference) => {
      dispatch(moveSense(src, dest));
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
