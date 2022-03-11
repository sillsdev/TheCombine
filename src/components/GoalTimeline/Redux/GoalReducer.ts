import { defaultState } from "components/GoalTimeline/DefaultState";
import {
  GoalAction,
  GoalActionTypes,
} from "components/GoalTimeline/Redux/GoalReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { GoalsState, GoalType } from "types/goals";

export const goalReducer = (
  state: GoalsState | undefined,
  action: StoreAction | GoalAction
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case GoalActionTypes.LOAD_USER_EDITS: {
      const history = [...action.payload];
      const previousGoalType =
        history[history.length - 1]?.goalType ?? GoalType.Default;
      return { ...state, history, previousGoalType };
    }
    case GoalActionTypes.SET_CURRENT_GOAL: {
      const currentGoal = action.payload;
      const goalTypeSuggestions = state.goalTypeSuggestions.filter(
        (type, index) => index !== 0 || action.payload.goalType !== type
      ); // Remove top suggestion if same as goal to add.
      const previousGoalType =
        currentGoal.goalType !== GoalType.Default
          ? currentGoal.goalType
          : state.previousGoalType;
      return { ...state, currentGoal, goalTypeSuggestions, previousGoalType };
    }
    case StoreActionTypes.RESET: {
      return defaultState;
    }
    default: {
      return state;
    }
  }
};
