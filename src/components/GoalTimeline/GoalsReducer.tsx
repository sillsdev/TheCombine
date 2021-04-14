import { defaultState } from "components/GoalTimeline/DefaultState";
import { GoalAction, GoalsActions } from "components/GoalTimeline/GoalsActions";
import { StoreAction, StoreActions } from "rootActions";
import { GoalsState } from "types/goals";

export const goalsReducer = (
  state: GoalsState | undefined,
  action: StoreAction | GoalAction
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case GoalsActions.LOAD_USER_EDITS: {
      return { ...state, history: [...action.payload] };
    }
    case GoalsActions.SET_CURRENT_GOAL: {
      return { ...state, currentGoal: action.payload };
    }
    case StoreActions.RESET: {
      return defaultState;
    }
    default: {
      return state;
    }
  }
};
