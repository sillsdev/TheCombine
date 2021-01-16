import { connect } from "react-redux";
import {
  asyncAdvanceStep,
  asyncRefreshWords,
} from "../../../components/GoalTimeline/GoalsActions";

import { StoreState } from "../../../types";
import { StoreStateDispatch } from "../../../types/actions";
import {
  moveSenses,
  mergeAll,
  orderSense,
  orderDuplicate,
} from "./MergeDupStepActions";
import MergeDupStepComponent from "./MergeDupStepComponent";
import { MergeTreeReference } from "./MergeDupsTree";

export function mapStateToProps(state: StoreState) {
  return {
    words: state.mergeDuplicateGoal.tree.words,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    advanceStep: () => {
      dispatch(asyncAdvanceStep());
    },
    refreshWords: () => {
      dispatch(asyncRefreshWords());
    },
    moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => {
      dispatch(moveSenses(src, dest));
    },
    orderSense: (wordID: string, senseID: string, order: number) => {
      dispatch(orderSense(wordID, senseID, order));
    },
    orderDuplicate: (ref: MergeTreeReference, order: number) => {
      dispatch(orderDuplicate(ref, order));
    },
    mergeAll: () => {
      return dispatch(mergeAll());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
