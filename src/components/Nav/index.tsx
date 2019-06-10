import { NavComponent } from "./NavComponent";
import * as actions from "./navActions";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { NavState } from "../../types/nav";
import { Goal } from "../../types/goals";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState): NavState {
  return {
    CurrentComponent: state.navState.CurrentComponent
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, actions.ChangeDisplay>
) {
  return {
    displayGoal: (goal: Goal) => dispatch(actions.asyncChangeDisplay(goal))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavComponent);
