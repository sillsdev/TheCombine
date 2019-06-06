import { GoalsState } from "../../../types/goals";
import { GoalFuture } from "./GoalFutureComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";

export function mapStateToProps(state: StoreState): GoalsState {
  return {
    history: state.goalsState.history,
    all: state.goalsState.all,
    suggestions: state.goalsState.suggestions
  };
}

export default connect(mapStateToProps)(GoalFuture);
