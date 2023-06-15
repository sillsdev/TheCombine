import { ActionWithPayload } from "types/Redux/actions";
import { Goal, GoalsState, GoalType } from "types/goals";

export enum GoalActionTypes {
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  SET_CURRENT_GOAL = "SET_CURRENT_GOAL",
}

export type GoalAction = LoadUserEditsAction | SetCurrentGoalAction;

export interface LoadUserEditsAction extends ActionWithPayload<Goal[]> {
  type: GoalActionTypes.LOAD_USER_EDITS;
  payload: Goal[];
}

export interface SetCurrentGoalAction extends ActionWithPayload<Goal> {
  type: GoalActionTypes.SET_CURRENT_GOAL;
  payload: Goal;
}

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
