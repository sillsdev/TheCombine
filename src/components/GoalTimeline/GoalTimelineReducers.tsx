import { GoalsState } from "../../types/goals";
import Stack from "../../types/stack";
import { Goal } from "../../types/goals";
import { ADD_GOAL } from "./GoalTimelineActions";
import { ActionWithPayload } from "../../types/action";
import { defaultState } from "./DefaultState";

export const goalsReducer = (
  state: GoalsState | undefined,
  action: ActionWithPayload<Goal>
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case ADD_GOAL:
      let newHistory = state.historyState.history.makeCopy();
      newHistory = addGoalToHistory(newHistory, action.payload);
      let newSuggestions = state.suggestionsState.suggestions.makeCopy();
      newSuggestions = removeGoalFromSuggestions(
        newSuggestions,
        action.payload
      );
      return {
        historyState: {
          history: newHistory
        },
        goalOptions: state.goalOptions,
        suggestionsState: {
          suggestions: newSuggestions
        }
      };
    default:
      return state;
  }
};

export function addGoalToHistory(
  history: Stack<Goal>,
  goal: Goal
): Stack<Goal> {
  history.push(goal);
  return history;
}

export function removeGoalFromSuggestions(
  suggestions: Stack<Goal>,
  goal: Goal
): Stack<Goal> {
  let nextSuggestion = suggestions.peekFirst();
  if (nextSuggestion && nextSuggestion.name === goal.name) {
    let newSuggestions = new Stack<Goal>(
      suggestions.stack.filter(goal => nextSuggestion.name !== goal.name)
    );
    return newSuggestions;
  }
  return suggestions;
}
