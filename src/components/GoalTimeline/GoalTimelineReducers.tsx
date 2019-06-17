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
    case ADD_GOAL: // Remove top suggestion if same as goal to add
      let suggestions = state.suggestionsState.suggestions;

      let nextSuggestion = suggestions[0];
      let goalToAdd = action.payload;

      let newSuggestions: Goal[] =
        /* If the next suggestion is the same as the goal being added, remove the suggestion */
        nextSuggestion && nextSuggestion.name === goalToAdd.name
          ? suggestions.filter(goal => nextSuggestion.name != goal.name)
          : suggestions;

      return Object.assign({}, state, {
        historyState: {
          history: [...state.historyState.history, goalToAdd]
        },
        goalOptions: state.goalOptions,
        suggestionsState: {
          suggestions: newSuggestions
        }
      });
    default:
      return state;
  }
};
