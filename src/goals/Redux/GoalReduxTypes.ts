import { Goal, GoalType } from "types/goals";

export enum DataLoadStatus {
  Default = "DEFAULT",
  Failure = "FAILURE",
  Loading = "LOADING",
  Success = "SUCCESS",
}

// The representation of goals in the redux store
export interface GoalsState {
  allGoalTypes: GoalType[];
  currentGoal: Goal;
  dataLoadStatus: DataLoadStatus;
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
  dataLoadStatus: DataLoadStatus.Default,
  goalTypeSuggestions: [...implementedTypes],
  history: [],
  previousGoalType: GoalType.Default,
};
