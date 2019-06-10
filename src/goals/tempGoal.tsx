import * as React from "react";
import { Goal, Tools, GoalOption } from "../types/goals";
import Temp from "../components/Temp";
import { User } from "../types/user";

export interface TempData {
  words: String[]; // Would more likely be an array of Words in an actual Goal
  step: number; // Stores the index of the current step
}

export interface TempStep {}

export class TempGoal implements Goal {
  id: number;
  name: string;

  display: React.FC;
  displaySelectorItem: React.FC;
  user: User;

  steps: React.Component[];
  completed: boolean;
  tool: Tools;
  result: GoalOption;
  data: any;

  constructor(user: User) {
    this.id = -1;
    this.name = "Temp goal";
    this.user = user;
    this.completed = false;
    this.tool = Tools.TempTool;
    this.result = GoalOption.Current;
    this.data = {
      words: [],
      step: 0
    };

    this.display = () => {
      return (
        <div className="TempGoal">
          <Temp />
        </div>
      );
    };

    this.displaySelectorItem = () => {
      return (
        <div className="TempGoalSelected">
          <Temp />
        </div>
      );
    };

    this.steps = [];
  }
}
