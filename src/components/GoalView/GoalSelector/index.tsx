import { GoalsState, Goals } from "../../../types/goals";
import { GoalSelector } from "./GoalSelectorComponent";
import * as actions from "../GoalViewActions";

import { connect } from "react-redux";
import { Dispatch } from "react";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState): GoalsState {
  return {
    history: state.goalsState.history,
    all: state.goalsState.all,
    suggestions: state.goalsState.suggestions
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.AddGoal>
) {
  return {
    addGoal: (goal: Goals) => dispatch(actions.asyncAddGoal(goal))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSelector);
