import { GoalsState } from "../../../types/goals";
import { GoalHistory } from "./GoalHistoryComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";

export function mapStateToProps(state: StoreState): GoalsState {
  return {
    history: state.goalsState.history,
    suggestions: state.goalsState.suggestions
  };
}

export default connect(mapStateToProps)(GoalHistory);
