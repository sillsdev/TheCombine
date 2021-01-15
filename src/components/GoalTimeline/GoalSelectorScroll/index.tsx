import { connect } from "react-redux";

import { StoreState } from "../../../types";
import { StoreStateDispatch } from "../../../types/actions";
import { GoalSelectorState } from "../../../types/goals";
import {
  scrollSelectorIndexAction,
  scrollSelectorMouseAction,
} from "./GoalSelectorAction";
import GoalSelectorScroll from "./GoalSelectorScroll";

export function mapStateToProps(state: StoreState): GoalSelectorState {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals,
    selectedIndex: state.goalSelectorState.selectedIndex,
    mouseX: state.goalSelectorState.mouseX,
    lastIndex: state.goalsState.allPossibleGoals.length - 1,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
