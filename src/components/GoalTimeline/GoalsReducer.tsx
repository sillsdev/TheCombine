import { defaultState } from "components/GoalTimeline/DefaultState";
import { GoalsActions, GoalAction } from "components/GoalTimeline/GoalsActions";
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
    case GoalsActions.LOAD_USER_EDITS:
      return {
        ...state,
        historyState: {
          history: [...action.payload],
        },
      };
    case GoalsActions.ADD_GOAL_TO_HISTORY: // Remove top suggestion if same as goal to add
      let suggestions = state.suggestionsState.suggestions;
      let goalToAdd = action.payload;
      return {
        ...state,
        historyState: {
          history: [...state.historyState.history, goalToAdd],
        },
        suggestionsState: {
          suggestions: suggestions.filter(
            (goal, index) => index !== 0 || goalToAdd.name !== goal.name
          ),
        },
      };
    case GoalsActions.UPDATE_GOAL: {
      const history = [...state.historyState.history];
      const goalIndex = history.findIndex(
        (g) => g.guid === action.payload.guid
      );
      history.splice(goalIndex, 1, action.payload);
      return {
        ...state,
        historyState: { history },
      };
    }
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
