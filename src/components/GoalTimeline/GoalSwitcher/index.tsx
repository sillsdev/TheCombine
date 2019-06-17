import { Goal, GoalSwitcherState } from "../../../types/goals";
import GoalSwitcher from "./GoalSwitcherComponent";
import * as timelineActions from "../GoalTimelineActions";
import * as navActions from "../../Navigation/NavigationActions";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState): GoalSwitcherState {
  return {
    goalOptions: state.goalsState.goalOptions
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, timelineActions.AddGoal>
) {
  return {
    chooseGoal: (goal: Goal) => {
      dispatch(timelineActions.asyncAddGoalToHistory(goal));
      dispatch(navActions.asyncNavigateForward(goal));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSwitcher);
