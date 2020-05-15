import { GoalHistoryState } from "../../../types/goals";
import GoalHistory from "./GoalHistoryComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";

export function mapStateToProps(state: StoreState): GoalHistoryState {
  return {
    history: state.goalsState.historyState.history,
  };
}

export default connect(mapStateToProps)(GoalHistory);
