import { connect } from "react-redux";

import { asyncAdvanceStep } from "components/GoalTimeline/GoalsActions";
import {
  mergeAll,
  setSidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import MergeDupStepComponent from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState) {
  return { wordCount: Object.keys(state.mergeDuplicateGoal.tree.words).length };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    advanceStep: () => {
      dispatch(asyncAdvanceStep());
    },
    clearSidebar: () => {
      return dispatch(setSidebar());
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
