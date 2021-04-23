import { ActionWithPayload } from "types/Redux/actions";
import { Goal } from "types/goals";

export enum GoalsActions {
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  SET_CURRENT_GOAL = "SET_CURRENT_GOAL",
}

export type GoalAction = LoadUserEditsAction | SetCurrentGoalAction;

export interface SetCurrentGoalAction extends ActionWithPayload<Goal> {
  type: GoalsActions.SET_CURRENT_GOAL;
  payload: Goal;
}

export interface LoadUserEditsAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.LOAD_USER_EDITS;
  payload: Goal[];
}
