import { GoalViewState } from "../../types/goals";
import { GoalView } from "./GoalView";
import { connect } from "react-redux";
import { StoreState } from "../../types";

export function mapStateToProps(state: StoreState): GoalViewState {
  return {
    state: state.goalsState
  };
}

export default connect(mapStateToProps)(GoalView);
