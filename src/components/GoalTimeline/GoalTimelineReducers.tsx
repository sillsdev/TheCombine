import { GoalsState } from "../../types/goals";
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
      let newHistory = addGoalToHistory(
        state.historyState.history,
        action.payload
      );
      let newSuggestions = removeGoalFromSuggestions(
        state.suggestionsState.suggestions,
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

export function addGoalToHistory(history: Goal[], goal: Goal): Goal[] {
  let newHistory = history;
  newHistory.push(goal);
  return history;
}

export function removeGoalFromSuggestions(
  suggestions: Goal[],
  goal: Goal
): Goal[] {
  let nextSuggestion = suggestions[0];
  if (nextSuggestion && nextSuggestion.name === goal.name) {
    let newSuggestions = suggestions.filter(
      goal => nextSuggestion.name != goal.name
    );
    return newSuggestions;
  }
  return suggestions;
}
