import { User } from "./User";
import { MergeDupData, MergeDupStepProps } from "../goals/MergeDupGoal";
import Stack from "./stack";
import { MergeDupProps } from "../goals/MergeDupGoal/MergeDupComponent";

export enum GoalOption {
  Complete,
  Abandon,
  Current
}

export enum Tools {
  TempTool, // To be removed once testing is finished
  FixDups,
  CharInv,
  CharCreate
}

export type GoalProps = MergeDupProps;

export type GoalData = MergeDupData; // | OtherTypes
export type GoalStep = MergeDupStepProps; // | OtherTypes

export type GoalStep = MergeDupStepProps; // | OtherTypes
export interface GoalViewState {
  state: GoalsState;
}

// The representation of goals in the redux store
export interface GoalsState {
  historyState: GoalHistoryState;
  goalOptions: Goal[];
  suggestionsState: GoalSuggestionsState;
}

export interface GoalHistoryState {
  history: Stack<Goal>;
}

export interface GoalSuggestionsState {
  suggestions: Stack<Goal>;
}

export interface GoalSwitcherState {
  goalOptions: Goal[];
}

export interface Goal {
  id: number;
  name: string;
  user: User;

  display: JSX.Element;
  goalWidget: JSX.Element;

  steps: JSX.Element[];
  curNdx: number;
  data: GoalData; // The data required to load/reload this exact goal

  tool: Tools;
  completed: boolean;
  result: GoalOption;
}

