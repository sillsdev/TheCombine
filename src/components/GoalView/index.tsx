import * as navActions from "../Nav/navActions";
import * as goalActions from "./GoalViewActions";

import { connect } from "react-redux";
import { StoreState } from "../../types/index";
import { Goal } from "../../types/goals";
import { ThunkDispatch } from "redux-thunk";
import { GoalView } from "./GoalView";

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, navActions.ChangeDisplay>
) {
  return {
    displayGoal: (goal: Goal) => {
      dispatch(navActions.asyncChangeDisplay(goal));
      dispatch(goalActions.asyncAddGoal(goal));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(GoalView);
