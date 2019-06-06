import * as React from "react";
import { User } from "./user";
import { TempData, TempStep } from "../goals/tempGoal";
import Stack from "./stack";

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

export type GoalData = TempData; // | OtherTypes
export type Steps = TempStep; // | OtherTypes

export interface GoalViewState {
  state: GoalsState;
}

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

export interface GoalSelectorState {
  goalOptions: Goal[];
}

export interface Goal {
  id: number;
  name: string;
  user: User;

  steps: React.Component[];
  data: GoalData; // The data required to load/reload this exact goal
  display: React.FC<React.Component>; //takes in a step
  displaySelectorItem: React.FC;

  tool: Tools;
  completed: boolean;
  result: GoalOption;
}

export const DefaultDisplay: React.FC<React.Component> = (
  step: React.Component
) => {
  return (
    <div>
      <DefaultHeaderDisplay />
      <DefaultProgDisplay />
      {step.render}
    </div>
  );
};

const DefaultProgDisplay: React.FC = () => {
  return (
    <div /> //empty placeholder while defining structure.
  );
};

const DefaultHeaderDisplay: React.FC = () => {
  return (
    <div /> //empty placeholder while defining structure.
  );
};
