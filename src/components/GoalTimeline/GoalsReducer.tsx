import { GoalsState, GoalType } from "../../types/goals";
import { Goal } from "../../types/goals";
import {
  ADD_GOAL_TO_HISTORY,
  LOAD_USER_EDITS,
  NEXT_STEP
} from "./GoalsActions";
import { ActionWithPayload } from "../../types/mockAction";
import { defaultState } from "./DefaultState";
import { MergeDupData } from "../../goals/MergeDupGoal/MergeDups";

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
      console.log("Next step");
      let history: Goal[] = state.historyState.history;
      let currentGoal: Goal = history[history.length - 1];

      switch (currentGoal.goalType) {
        case GoalType.MergeDups:
          let currentGoalData: MergeDupData = currentGoal.data as MergeDupData;

          currentGoal.steps[currentGoal.curNdx] = {
            words: currentGoalData.plannedWords[currentGoal.curNdx]
          };
          currentGoal.curNdx++;
      }

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
