import { ActionWithPayload } from "types/Redux/actions";
import { Goal, GoalStatus, GoalStep } from "types/goals";

export enum GoalActionTypes {
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  SET_CURRENT_GOAL = "SET_CURRENT_GOAL",
  SET_CURRENT_GOAL_INDEX = "SET_CURRENT_GOAL_INDEX",
  SET_CURRENT_GOAL_STATUS = "SET_CURRENT_GOAL_STATUS",
  SET_GOAL_CURRENT_STEP = "SET_GOAL_CURRENT_STEP",
  SET_GOAL_STEPS = "SET_GOAL_STEPS",
}

export type GoalAction =
  | LoadUserEditsAction
  | SetCurrentGoalAction
  | SetGoalIndexAction
  | SetGoalStatusAction
  | SetGoalCurrentStepAction
  | SetGoalStepsAction;

export interface LoadUserEditsAction extends ActionWithPayload<Goal[]> {
  type: GoalActionTypes.LOAD_USER_EDITS;
  payload: Goal[];
}

export interface SetCurrentGoalAction extends ActionWithPayload<Goal> {
  type: GoalActionTypes.SET_CURRENT_GOAL;
  payload: Goal;
}

export interface SetGoalIndexAction extends ActionWithPayload<number> {
  type: GoalActionTypes.SET_CURRENT_GOAL_INDEX;
  payload: number;
}

export interface SetGoalStatusAction extends ActionWithPayload<GoalStatus> {
  type: GoalActionTypes.SET_CURRENT_GOAL_STATUS;
  payload: GoalStatus;
}

export interface SetGoalCurrentStepAction extends ActionWithPayload<GoalStep> {
  type: GoalActionTypes.SET_GOAL_CURRENT_STEP;
  payload: GoalStep;
}

export interface SetGoalStepsAction extends ActionWithPayload<GoalStep[]> {
  type: GoalActionTypes.SET_GOAL_STEPS;
  payload: GoalStep[];
}
