import { Goal, GoalType } from "types/goals";

// The representation of goals in the redux store
export interface GoalsState {
  allGoalTypes: GoalType[];
  currentGoal: Goal;
  goalTypeSuggestions: GoalType[];
  history: Goal[];
  previousGoalType: GoalType;
}

// GoalType.ReviewDeferredDups is also implemented,
// but is conditionally available
const implementedTypes: GoalType[] = [
  GoalType.CreateCharInv,
  GoalType.MergeDups,
  GoalType.ReviewEntries,
];

export const defaultState: GoalsState = {
  allGoalTypes: implementedTypes,
  currentGoal: new Goal(),
  goalTypeSuggestions: [...implementedTypes],
  history: [],
  previousGoalType: GoalType.Default,
};

export function emptyGoalState(): GoalsState {
  return {
    ...defaultState,
    allGoalTypes: [],
    currentGoal: { ...new Goal(), guid: expect.any(String) },
    goalTypeSuggestions: [],
  };
}
