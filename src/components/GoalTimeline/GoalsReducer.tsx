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
        history: [...action.payload],
      };
    case GoalsActions.ADD_GOAL_TO_HISTORY: // Remove top suggestion if same as goal to add
      const suggestions = state.goalTypeSuggestions;
      const goalToAdd = action.payload;
      return {
        ...state,
        goalTypeSuggestions: suggestions.filter(
          (type, index) => index !== 0 || goalToAdd.goalType !== type
        ),
        history: [...state.history, goalToAdd],
      };
    case GoalsActions.UPDATE_GOAL: {
      const history = [...state.history];
      const goalToUpdate = action.payload;
      const goalIndex = history.findIndex((g) => g.guid === goalToUpdate.guid);
      history.splice(goalIndex, 1, goalToUpdate);
      return {
        ...state,
        history,
      };
    }
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
