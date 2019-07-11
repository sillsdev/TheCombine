import { Goal } from "../../../types/goals";
import { GoalTimelineHorizontal } from "./GoalTimelineHorizontal";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import {
  asyncAddGoalToHistory,
  LoadUserEditsAction,
  AddGoalToHistory,
  asyncGetUserEdits
} from "../GoalsActions";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState) {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals,
    history: state.goalsState.historyState.history,
    suggestions: state.goalsState.suggestionsState.suggestions
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<
    StoreState,
    any,
    LoadUserEditsAction | AddGoalToHistory
  >
) {
  return {
    chooseGoal: (goal: Goal) => {
      dispatch(asyncAddGoalToHistory(goal));
    },
    loadHistory: () => {
      dispatch(asyncGetUserEdits());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalTimelineHorizontal);
