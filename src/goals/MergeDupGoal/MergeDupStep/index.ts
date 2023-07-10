import { connect } from "react-redux";

import { asyncAdvanceStep } from "components/GoalTimeline/Redux/GoalActions";
import MergeDupStepComponent from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import { mergeAll, setSidebar } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return { wordCount: Object.keys(state.mergeDuplicateGoal.data.words).length };
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
