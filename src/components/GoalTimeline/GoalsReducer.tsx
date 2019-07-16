import { GoalsState, GoalType } from "../../types/goals";
import { Goal } from "../../types/goals";
import { GoalsActions, GoalAction } from "./GoalsActions";
import { defaultState } from "./DefaultState";
import { MergeDupData } from "../../goals/MergeDupGoal/MergeDups";
import { StoreAction, StoreActions } from "../../rootActions";

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
          history: [...action.payload]
        }
      };
    case GoalsActions.ADD_GOAL_TO_HISTORY: // Remove top suggestion if same as goal to add
      let suggestions = state.suggestionsState.suggestions;
      let goalToAdd = action.payload[0];
      return {
        ...state,
        historyState: {
          history: [...state.historyState.history, goalToAdd]
        },
        suggestionsState: {
          suggestions: suggestions.filter(
            (goal, index) => index !== 0 || goalToAdd.name !== goal.name
          )
        }
      };
    case GoalsActions.NEXT_STEP: // Update the step data in the current step, then go to the next step
      let currentIndex: number = state.historyState.history.length - 1;
      let currentGoal: Goal = updateStepData(
        state.historyState.history[currentIndex]
      );
      return {
        ...state,
        historyState: {
          history: [
            ...state.historyState.history.slice(0, currentIndex),
            currentGoal
          ]
        }
      };

    case GoalsActions.UPDATE_GOAL: {
      return {
        ...state,
        historyState: {
          history: [
            ...state.historyState.history.slice(0, -1),
            action.payload[0]
          ]
        }
      };
    }
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};

export function updateStepData(goal: Goal): Goal {
  switch (goal.goalType) {
    case GoalType.MergeDups: {
      let currentGoalData: MergeDupData = JSON.parse(
        JSON.stringify(goal.data as MergeDupData)
      );
      goal.steps[goal.currentStep] = {
        words: currentGoalData.plannedWords[goal.currentStep]
      };
      goal.currentStep++;
      break;
    }
    case GoalType.CreateCharInv: {
      break;
    }
  }
  return goal;
}
