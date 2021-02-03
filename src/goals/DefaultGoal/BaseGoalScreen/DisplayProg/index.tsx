import { connect } from "react-redux";

import DisplayProg from "goals/DefaultGoal/BaseGoalScreen/DisplayProg/displayProg";
import { StoreState } from "types";
import { Goal } from "types/goals";

function mapStateToProps(state: StoreState) {
  let history: Goal[] = state.goalsState.historyState.history;
  return {
    currentStep: history[history.length - 1].currentStep,
    numSteps: history[history.length - 1].numSteps,
  };
}

export default connect(mapStateToProps)(DisplayProg);
