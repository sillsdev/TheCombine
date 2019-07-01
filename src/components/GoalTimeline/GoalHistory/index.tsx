import { GoalHistoryState, Goal } from "../../../types/goals";
import GoalHistory from "./GoalHistoryComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  asyncLoadGoalHistory,
  LoadGoalHistoryAction
} from "./GoalHistoryActions";

export function mapStateToProps(state: StoreState): GoalHistoryState {
  return {
    history: state.goalsState.historyState.history
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, LoadGoalHistoryAction>
) {
  return {
    asyncLoadHistory: () => {
      dispatch(asyncLoadGoalHistory());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalHistory);
