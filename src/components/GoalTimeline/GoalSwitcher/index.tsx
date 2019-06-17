import { Goal, GoalSwitcherState } from "../../../types/goals";
import GoalSwitcher from "./GoalSwitcherComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";
import { asyncChooseGoal, ChooseGoal } from "./GoalSwitcherActions";

export function mapStateToProps(state: StoreState): GoalSwitcherState {
  return {
    goalOptions: state.goalsState.goalOptions
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ChooseGoal>
) {
  return {
    chooseGoal: (goal: Goal) => {
      dispatch(asyncChooseGoal(goal));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSwitcher);
