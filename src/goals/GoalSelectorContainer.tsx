import { GoalsState, Goals } from "../types/goals";
import { GoalSelector } from "./GoalSelector";
import * as actions from "./GoalUIActions";

import { connect } from "react-redux";
import { Dispatch } from "react";

export function mapStateToProps(state: GoalsState) {
  return state;
}

export function mapDispatchToProps(
  dispatch: Dispatch<actions.AddGoalToHistory>
) {
  return {
    addToHistory: (goal: Goals) => dispatch(actions.addGoalToHistory(goal))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSelector);
