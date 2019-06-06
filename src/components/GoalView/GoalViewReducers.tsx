import { GoalsState } from "../../types/goals";
import Stack from "../../types/stack";
import { Goals } from "../../types/goals";
import { ADD_GOAL_TO_HISTORY, AddGoalToHistoryAction } from "./GoalViewActions";

export const defaultState: GoalsState = {
  history: new Stack<Goals>([]),
  all: [],
  suggestions: new Stack<Goals>([])
};

export const goalsReducer = (
  state: GoalsState | undefined,
  action: AddGoalToHistoryAction
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case ADD_GOAL_TO_HISTORY:
      state.history.push(action.payload);
      return {
        history: state.history.makeCopy(),
        all: state.all,
        suggestions: state.suggestions
      };
    default:
      return state;
  }
};
