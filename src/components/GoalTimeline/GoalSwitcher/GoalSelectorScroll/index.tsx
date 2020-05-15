import GoalSelectorScroll from "./GoalSelectorScroll";
import {
  GoalScrollAction,
  scrollSelectorIndexAction,
  scrollSelectorMouseAction,
} from "./GoalSelectorAction";

import { connect } from "react-redux";
import { StoreState } from "../../../../types";
import { GoalSelectorState } from "../../../../types/goals";
import { Dispatch } from "redux";

export function mapStateToProps(state: StoreState): GoalSelectorState {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals,
    selectedIndex: state.goalSelectorState.selectedIndex,
    mouseX: state.goalSelectorState.mouseX,
    lastIndex: state.goalsState.allPossibleGoals.length - 1,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<GoalScrollAction>) {
  return {
    swapSelectedIndex: (ndx: number) => {
      dispatch(scrollSelectorIndexAction(ndx));
    },
    swapMouseX: (iX: number) => {
      dispatch(scrollSelectorMouseAction(iX));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GoalSelectorScroll);
