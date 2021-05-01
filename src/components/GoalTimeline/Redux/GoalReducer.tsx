import { defaultState } from "components/GoalTimeline/DefaultState";
import {
  GoalAction,
  GoalActionTypes,
} from "components/GoalTimeline/Redux/GoalReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { GoalsState } from "types/goals";

export const goalReducer = (
  state: GoalsState | undefined,
  action: StoreAction | GoalAction
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case GoalActionTypes.LOAD_USER_EDITS: {
      return { ...state, history: [...action.payload] };
    }
    case GoalActionTypes.SET_CURRENT_GOAL: {
      const goalTypeSuggestions = state.goalTypeSuggestions.filter(
        (type, index) => index !== 0 || action.payload.goalType !== type
      ); // Remove top suggestion if same as goal to add.
      return { ...state, currentGoal: action.payload, goalTypeSuggestions };
    }
    case StoreActionTypes.RESET: {
      return defaultState;
    }
    default: {
      return state;
    }
  }
};
