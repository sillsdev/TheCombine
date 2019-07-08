import { GoalsState, GoalType } from "../../types/goals";
import { Goal } from "../../types/goals";
import {
  ADD_GOAL_TO_HISTORY,
  LOAD_USER_EDITS,
  NEXT_STEP
} from "./GoalsActions";
import { ActionWithPayload } from "../../types/mockAction";
import { defaultState } from "./DefaultState";
import { MergeDupData, MergeDups } from "../../goals/MergeDupGoal/MergeDups";

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
    case NEXT_STEP: // Update the step data in the current step, then go to the next step
      let history: Goal[] = state.historyState.history;
      let currentGoal: Goal = history[history.length - 1];

      currentGoal = updateStepDataAndCurNdx(currentGoal);
      history.splice(-1, 1, currentGoal);

      return {
        historyState: {
          history: [...history]
        },
        allPossibleGoals: state.allPossibleGoals,
        suggestionsState: {
          suggestions: state.suggestionsState.suggestions
        }
      };
    default:
      return state;
  }
};

export function updateStepDataAndCurNdx(goal: Goal): Goal {
  switch (goal.goalType) {
    case GoalType.MergeDups:
      let currentGoalData: MergeDupData = goal.data as MergeDupData;

      goal.steps[goal.curNdx] = {
        words: currentGoalData.plannedWords[goal.curNdx]
      };
      goal.curNdx++;
  }

  return goal;
}
