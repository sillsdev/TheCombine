import { Goal, GoalsState, GoalType } from "types/goals";

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
