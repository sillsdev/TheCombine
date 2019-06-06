import { GoalSelectorDropdownState } from "../../../../types/goals";
import { GoalSelectorDropdown } from "./GoalSelectorDropdown";

import { connect } from "react-redux";
import { StoreState } from "../../../../types";

export function mapStateToProps(state: StoreState): GoalSelectorDropdownState {
  return {
    possibleGoals: state.goalsState.all
  };
}

export default connect(mapStateToProps)(GoalSelectorDropdown);
