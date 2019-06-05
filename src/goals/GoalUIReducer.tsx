import { ADD_GOAL_TO_HISTORY, AddGoalToHistoryAction } from "./GoalUIActions";
import { GoalsState, Goals } from "../types/goals";
import { Stack } from "../types/stack";

export const defaultState: GoalsState = {
  history: {
    goals: new Stack<Goals>([])
  },
  suggestions: {
    goals: new Stack<Goals>([])
  }
};

export const goalsReducer = (
  state: GoalsState | undefined,
  action: AddGoalToHistoryAction
): GoalsState => {
  if (!state) return defaultState;
  switch (action.type) {
    case ADD_GOAL_TO_HISTORY:
      return {
        history: {
          goals: state.history.goals.push(action.payload)
        },
        suggestions: state.suggestions
      };
    default:
      return state;
  }
};
