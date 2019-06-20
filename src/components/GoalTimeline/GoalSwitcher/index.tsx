import { Goal, GoalSwitcherState } from "../../../types/goals";
import GoalSwitcher from "./GoalSwitcherComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { chooseGoal, ChooseGoal } from "./GoalSwitcherActions";
import { ThunkDispatch } from "redux-thunk";

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
      dispatch(chooseGoal(goal));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSwitcher);
