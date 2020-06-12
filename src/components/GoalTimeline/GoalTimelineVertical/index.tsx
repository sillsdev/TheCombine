import { Goal } from "../../../types/goals";
import { GoalTimelineVertical } from "./GoalTimelineVertical";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import {
  asyncAddGoalToHistory,
  asyncGetUserEdits,
  GoalAction,
} from "../GoalsActions";
import { ThunkDispatch } from "redux-thunk";

export function mapStateToProps(state: StoreState) {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals,
    history: state.goalsState.historyState.history,
    suggestions: state.goalsState.suggestionsState.suggestions,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, GoalAction>
) {
  return {
    chooseGoal: (goal: Goal) => {
      dispatch(asyncAddGoalToHistory(goal));
    },
    loadHistory: () => {
      dispatch(asyncGetUserEdits());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalTimelineVertical);
