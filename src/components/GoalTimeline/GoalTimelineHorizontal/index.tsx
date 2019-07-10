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
    loadUserEdits: (projectId: string, userEditId: string) => {
      dispatch(asyncLoadUserEdits(projectId, userEditId));
    },
    createUserEditsObject: (projectId: string) => {
      dispatch(asyncCreateNewUserEditsObject(projectId));
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
