import { GoalsState, Goal } from "../../../types/goals";
import { GoalSelector } from "./GoalSelectorComponent";
import * as actions from "../GoalViewActions";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState): GoalsState {
  return {
    history: state.goalsState.history,
    goalOptions: state.goalsState.goalOptions,
    suggestions: state.goalsState.suggestions
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.AddGoal>
) {
  return {
    addGoal: (goal: Goal) => dispatch(actions.asyncAddGoal(goal))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSelector);
