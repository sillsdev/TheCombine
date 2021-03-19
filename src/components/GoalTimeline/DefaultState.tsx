import { GoalsState, GoalType } from "types/goals";

const implementedTypes: GoalType[] = [
  GoalType.CreateCharInv,
  GoalType.MergeDups,
  GoalType.ReviewEntries,
];

export const defaultState: GoalsState = {
  allGoalTypes: implementedTypes,
  goalTypeSuggestions: [...implementedTypes],
  history: [],
};
