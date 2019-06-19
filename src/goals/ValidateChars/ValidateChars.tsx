import React from "react";
import { Goal, GoalData, Tools, GoalOption } from "../../types/goals";
import { User } from "../../types/user";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import BaseGoalSelect from "../../goals/DefaultGoal/BaseGoalSelect/BaseGoalSelect";

export class ValidateChars implements Goal {
  id: number;
  name: string;
  user: User;
  display: JSX.Element;
  goalWidget: JSX.Element;
  steps: JSX.Element[];
  curNdx: number;
  data: GoalData;
  tool: Tools;
  completed: boolean;
  result: GoalOption;

  constructor(steps: JSX.Element[]) {
    this.id = -1;
    this.name = "validateChars";
    this.user = new User("", "", "");
    this.display = <BaseGoalScreen goal={this} />;
    this.goalWidget = <BaseGoalSelect goal={this} />;
    this.steps = steps;
    this.curNdx = 0;
    this.data = {};
    this.tool = Tools.TempTool;
    this.completed = false;
    this.result = GoalOption.Current;
  }
}
