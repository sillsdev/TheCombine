import { connect } from "react-redux";

import GoalHistory from "components/GoalTimeline/GoalHistory/GoalHistoryComponent";
import { StoreState } from "types";
import { GoalHistoryState } from "types/goals";

function mapStateToProps(state: StoreState): GoalHistoryState {
  return {
    history: state.goalsState.historyState.history,
  };
}

export default connect(mapStateToProps)(GoalHistory);
