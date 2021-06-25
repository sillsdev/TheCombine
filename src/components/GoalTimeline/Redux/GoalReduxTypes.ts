import { Goal } from "types/goals";
import { ActionWithPayload } from "types/Redux/actions";

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
