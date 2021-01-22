import { connect } from "react-redux";

import { StoreState } from "types";
import { GoalHistoryState } from "types/goals";
import GoalHistory from "components/GoalTimeline/GoalHistory/GoalHistoryComponent";

export function mapStateToProps(state: StoreState): GoalHistoryState {
  return {
    history: state.goalsState.historyState.history,
  };
}

export default connect(mapStateToProps)(GoalHistory);
