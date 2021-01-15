import { connect } from "react-redux";

import { StoreState } from "../../types";
import { StoreStateDispatch } from "../../types/actions";
import { Goal } from "../../types/goals";
import GoalTimeline from "./GoalTimelineComponent";
import { asyncAddGoalToHistory, asyncGetUserEdits } from "./GoalsActions";

export function mapStateToProps(state: StoreState) {
  return {
    allPossibleGoals: state.goalsState.allPossibleGoals,
    history: state.goalsState.historyState.history.reverse(),
    suggestions: state.goalsState.suggestionsState.suggestions,
  };
}

export function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
