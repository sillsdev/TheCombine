import { connect } from "react-redux";

import DisplayProg from "./displayProg";
import { StoreState } from "../../../../types";
import { Goal } from "../../../../types/goals";

function mapStateToProps(state: StoreState) {
  let history: Goal[] = state.goalsState.historyState.history;
  return {
    goal: history[history.length - 1]
  };
}

export default connect(mapStateToProps)(DisplayProg);
