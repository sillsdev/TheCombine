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
  history: Goal[];
  previousGoal: GoalName;
}

export const implementedGoals: GoalName[] = [
  GoalName.CreateCharInv,
  GoalName.MergeDups,
  GoalName.ReviewDeferredDups,
  GoalName.ReviewEntries,
];

export const defaultState: GoalsState = {
  allGoals: [...implementedGoals],
  currentGoal: new Goal(),
  dataLoadStatus: DataLoadStatus.Default,
  history: [],
  previousGoal: GoalName.Default,
};
