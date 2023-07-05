import { ActionWithPayload } from "types/Redux/actions";
import { Goal, GoalsState, GoalStep, GoalType } from "types/goals";

export enum GoalActionTypes {
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  SET_CURRENT_GOAL = "SET_CURRENT_GOAL",
  SET_CURRENT_GOAL_INDEX = "SET_CURRENT_GOAL_INDEX",
  SET_CURRENT_GOALS_STATE = "SET_CURRENT_GOALS_STATE",
  SET_GOAL_CURRENT_STEP = "SET_GOAL_CURRENT_STEP",
  SET_GOAL_STEPS = "SET_GOAL_STEPS",
}

export type GoalAction =
  | LoadUserEditsAction
  | SetCurrentGoalAction
  | SetGoalIndexAction
  | SetGoalsStateAction
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

export interface SetGoalsStateAction extends ActionWithPayload<GoalsState> {
  type: GoalActionTypes.SET_CURRENT_GOALS_STATE;
  payload: GoalsState;
}

export interface SetGoalCurrentStepAction extends ActionWithPayload<GoalStep> {
  type: GoalActionTypes.SET_GOAL_CURRENT_STEP;
  payload: GoalStep;
}

export interface SetGoalStepsAction extends ActionWithPayload<GoalStep[]> {
  type: GoalActionTypes.SET_GOAL_STEPS;
  payload: GoalStep[];
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
