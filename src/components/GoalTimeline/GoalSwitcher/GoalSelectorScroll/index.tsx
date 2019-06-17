import GoalSelectorScroll from "./GoalSelectorScroll";
import {
  ScrollAction,
  scrollSelectorIndexAction,
  scrollSelectorMouseAction
} from "./GoalSelectorAction";

import { connect } from "react-redux";
import { StoreState } from "../../../../types";
import { GoalSelectorState } from "../../../../types/goals";
import { ThunkDispatch } from "redux-thunk";

// TODO: Add in connection to the store
export function mapStateToProps(state: StoreState): GoalSelectorState {
  return {
    goalOptions: state.goalsState.goalOptions,
    ndx: state.gsState.ndx,
    iX: state.gsState.iX,
    end: state.goalsState.goalOptions.length - 1
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ScrollAction>
) {
  return {
    swapNdx: (ndx: number) => {
      dispatch(scrollSelectorIndexAction(ndx));
    },
    swapIX: (iX: number) => {
      dispatch(scrollSelectorMouseAction(iX));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalSelectorScroll);
