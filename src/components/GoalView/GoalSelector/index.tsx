import { GoalsState, Goals } from "../../../types/goals";
import { GoalSelector } from "./GoalSelectorComponent";
import * as actions from "../GoalViewActions";

import { connect } from "react-redux";
import { Dispatch } from "react";

export function mapStateToProps(state: GoalsState) {
  return { ...state };
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
