import { connect } from "react-redux";

import { asyncAdvanceStep } from "components/GoalTimeline/GoalsActions";
import {
  moveSenses,
  mergeAll,
  orderSense,
  orderDuplicate,
  setSideBar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import MergeDupStepComponent from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import {
  MergeTreeReference,
  SideBar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState) {
  return { ...state.mergeDuplicateGoal.tree };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    advanceStep: () => {
      dispatch(asyncAdvanceStep());
    },
    moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => {
      dispatch(moveSenses(src, dest));
    },
    orderSense: (ref: MergeTreeReference) => {
      dispatch(orderSense(ref));
    },
    orderDuplicate: (ref: MergeTreeReference, order: number) => {
      dispatch(orderDuplicate(ref, order));
    },
    mergeAll: () => {
      return dispatch(mergeAll());
    },
    setSideBar: (sideBar?: SideBar) => {
      return dispatch(setSideBar(sideBar));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
