import * as React from "react";
import { User } from "./user";
import { MergeDupData, MergeDupStepProps } from "../goals/MergeDupGoal";
import Stack from "./stack";
import BaseGoalScreen from "../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import BaseGoalSelect from "../goals/DefaultGoal/BaseGoalSelect/BaseGoalSelect";
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

  display: JSX.Element;
  goalWidget: JSX.Element;

  steps: React.Component[];
  curNdx: number;
  data: GoalData; // The data required to load/reload this exact goal

  tool: Tools;
  completed: boolean;
  result: GoalOption;
}

export class BaseGoal implements Goal {
  id: number;
  name: string;
  user: User;

  display: JSX.Element;
  goalWidget: JSX.Element;

  steps: React.Component[];
  curNdx: number;
  data: GoalData; // The data required to load/reload this exact goal

  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor() {
    this.id = -1;
    this.name = "";
    this.user = {
      name: "",
      username: "",
      id: -1
    };
    this.display = <BaseGoalScreen goal={this} />;
    this.goalWidget = <BaseGoalSelect goal={this} />;
    this.steps = [];
    this.curNdx = -1;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
