import { GoalsState, Goals } from "../../../types/goals";
import { GoalSelector } from "./GoalSelectorComponent";
import * as actions from "../GoalViewActions";

import { connect } from "react-redux";
import { Dispatch } from "react";
import { StoreState } from "../../../types";

export function mapStateToProps(state: StoreState): GoalsState {
  return {
    history: state.goalsState.history,
    all: state.goalsState.all,
    suggestions: state.goalsState.suggestions
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AddGoal>) {
  return {
    addGoal: (goal: Goals) => dispatch(actions.addGoal(goal))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSelector);
