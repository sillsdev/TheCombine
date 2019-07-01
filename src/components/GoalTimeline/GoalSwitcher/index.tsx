import { Goal, GoalSwitcherState } from "../../../types/goals";
import GoalSwitcher from "./GoalSwitcherComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  asyncAddGoalToHistory,
  AddGoalToHistory
} from "../GoalTimelineActions";

export function mapStateToProps(state: StoreState): GoalSwitcherState {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, AddGoalToHistory>
) {
  return {
    chooseGoal: (goal: Goal) => {
      dispatch(asyncAddGoalToHistory(goal));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSwitcher);
