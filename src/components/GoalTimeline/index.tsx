import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import { StoreState } from "../../types";
import { Goal } from "../../types/goals";
import GoalTimeline from "./GoalTimelineComponent";
import {
  asyncAddGoalToHistory,
  asyncGetUserEdits,
  GoalAction,
} from "./GoalsActions";

export function mapStateToProps(state: StoreState) {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals,
    history: state.goalsState.historyState.history.reverse(),
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

export default connect(mapStateToProps, mapDispatchToProps)(GoalTimeline);
