import { Goal, GoalName } from "types/goals";

export enum DataLoadStatus {
  Default = "DEFAULT",
  Failure = "FAILURE",
  Loading = "LOADING",
  Success = "SUCCESS",
}

// The representation of goals in the redux store
export interface GoalsState {
  allGoals: GoalName[];
  currentGoal: Goal;
  dataLoadStatus: DataLoadStatus;
  goalSuggestions: GoalName[];
  history: Goal[];
  previousGoal: GoalName;
}

/** MergeDups, ReviewEntries, CreateCharInv (in that recommendation order);
 * no ReviewDeferredDups, which is implemented but conditionally available. */
export const implementedGoals: GoalName[] = [
  GoalName.MergeDups,
  GoalName.ReviewEntries,
  GoalName.CreateCharInv,
];

export const defaultState: GoalsState = {
  allGoals: [...implementedGoals],
  currentGoal: new Goal(),
  dataLoadStatus: DataLoadStatus.Default,
  goalSuggestions: [...implementedGoals],
  history: [],
  previousGoal: GoalName.Default,
};
