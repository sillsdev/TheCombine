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
    case GoalsActions.ADD_GOAL_TO_HISTORY: {
      const currentGoal = action.payload;
      const goalTypeSuggestions = state.goalTypeSuggestions.filter(
        (type, index) => index !== 0 || currentGoal.goalType !== type
      ); // Remove top suggestion if same as goal to add
      return {
        ...state,
        currentGoal,
        goalTypeSuggestions,
        history: [...state.history, currentGoal],
      };
    }
    case GoalsActions.LOAD_USER_EDITS: {
      return { ...state, history: [...action.payload] };
    }
    case GoalsActions.SET_CURRENT_GOAL: {
      return { ...state, currentGoal: action.payload };
    }
    case GoalsActions.UPDATE_GOAL: {
      const goalToUpdate = action.payload;
      const currentGoal =
        goalToUpdate.guid === state.currentGoal.guid
          ? goalToUpdate
          : state.currentGoal;
      const history = [...state.history];
      const goalIndex = history.findIndex((g) => g.guid === goalToUpdate.guid);
      history.splice(goalIndex, 1, goalToUpdate);
      return { ...state, currentGoal, history };
    }
    case StoreActions.RESET: {
      return defaultState;
    }
    default: {
      return state;
    }
  }
};
