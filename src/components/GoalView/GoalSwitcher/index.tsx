import { Goal, GoalSelectorState } from "../../../types/goals";
import GoalSwitcher from "./GoalSwitcherComponent";
import * as actions from "../GoalTimelineActions";
import * as navActions from "../../Nav/NavActions";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState): GoalSelectorState {
  return {
    goalOptions: state.goalsState.goalOptions
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.AddGoal>
) {
  return {
    chooseGoal: (goal: Goal) => {
      dispatch(actions.asyncAddGoal(goal));
      dispatch(navActions.asyncChangeDisplay(goal));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSwitcher);
