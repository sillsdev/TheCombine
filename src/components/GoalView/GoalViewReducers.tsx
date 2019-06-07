import { GoalsState } from "../../types/goals";
import Stack from "../../types/stack";
import { Goal } from "../../types/goals";
import { ADD_GOAL, ActionWithPayload } from "./GoalViewActions";
import { defaultState } from "./TempDefaultState";

export const goalsReducer = (
  state: GoalsState | undefined,
  action: ActionWithPayload<Goal>
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case ADD_GOAL:
      let newHistory = addGoalToHistory(state, action.payload);
      let newSuggestions = removeGoalFromSuggestions(state, action.payload);
      return {
        history: newHistory.makeCopy(),
        goalOptions: state.goalOptions,
        suggestions: newSuggestions.makeCopy()
      };
    default:
      return state;
  }
};

export function addGoalToHistory(state: GoalsState, goal: Goal): Stack<Goal> {
  state.history.push(goal);
  return state.history;
}

export function removeGoalFromSuggestions(
  state: GoalsState,
  goal: Goal
): Stack<Goal> {
  let nextSuggestion = state.suggestions.peekFirst();
  if (nextSuggestion && nextSuggestion.name === goal.name) {
    let newSuggestions = new Stack<Goal>(
      state.suggestions.stack.filter(goal => nextSuggestion.name != goal.name)
    );
    return newSuggestions;
  }
  return state.suggestions;
}
