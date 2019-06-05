import { SuggestedGoalsState } from "../../../types/goals";
import { GoalFuture } from "./GoalFutureComponent";

import { connect } from "react-redux";

export function mapStateToProps(state: SuggestedGoalsState) {
  return {
    goals: state.goals
  };
}

export default connect(mapStateToProps)(GoalFuture);
