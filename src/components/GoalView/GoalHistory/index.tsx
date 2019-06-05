import { GoalsHistoryState } from "../../../types/goals";
import { GoalHistory } from "./GoalHistoryComponent";

import { connect } from "react-redux";

export function mapStateToProps(state: GoalsHistoryState) {
  return {
    goals: state.goals
  };
}

export default connect(mapStateToProps)(GoalHistory);
