import * as React from "react";
import { User } from "./user";
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
    this.steps = [];
    this.curNdx = -1;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
