import { GoalsState } from "../../types/goals";
import { Goal } from "../../types/goals";
import { ADD_GOAL_TO_HISTORY, LOAD_USER_EDITS } from "./GoalTimelineActions";
import { ActionWithPayload } from "../../types/action";
import { defaultState } from "./DefaultState";

export const goalsReducer = (
  state: GoalsState | undefined,
  action: ActionWithPayload<Goal[]>
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case LOAD_USER_EDITS:
      return {
        historyState: {
          history: [...action.payload]
        },
        allPossibleGoals: state.allPossibleGoals,
        suggestionsState: {
          suggestions: state.suggestionsState.suggestions
        }
      };
    case ADD_GOAL_TO_HISTORY: // Remove top suggestion if same as goal to add
      let suggestions = state.suggestionsState.suggestions;
      let goalToAdd = action.payload[0];
      return {
        historyState: {
          history: [...state.historyState.history, goalToAdd]
        },
        allPossibleGoals: state.allPossibleGoals,
        suggestionsState: {
          suggestions: suggestions.filter(
            (goal, index) =>
              index !== 0 || (index === 0 && goalToAdd.name !== goal.name)
          )
        }
      };

    default:
      return state;
  }
};
