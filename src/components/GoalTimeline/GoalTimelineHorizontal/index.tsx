import { Goal } from "../../../types/goals";
import { GoalTimelineHorizontal } from "./GoalTimelineHorizontal";

import { connect } from "react-redux";
import { StoreState } from "../../../types";
import {
  asyncLoadUserEdits,
  asyncAddGoalToHistory,
  LoadUserEditsAction,
  AddGoalToHistory,
  asyncCreateNewUserEditsObject
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
    loadUserEdits: (id: string) => {
      dispatch(asyncLoadUserEdits(id));
    },
    createUserEditsObject: () => {
      dispatch(asyncCreateNewUserEditsObject());
    },
    chooseGoal: (goal: Goal) => {
      dispatch(asyncAddGoalToHistory(goal));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalTimelineHorizontal);
