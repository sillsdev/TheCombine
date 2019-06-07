import React from "react";

import { Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import GoalSelectorDropdown from "./GoalSelectorDropdown/";

export interface GoalSelectorProps {
  addGoal: (goal: Goal) => void;
  history: Stack<Goal>;
  goalOptions: Goal[];
  suggestions: Stack<Goal>;
}

export class GoalSelector extends React.Component<GoalSelectorProps> {
  constructor(props: GoalSelectorProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<{ name?: string; value: unknown }>) {
    let name = event.target.value as string;
    let goal: Goal | undefined = this.findGoalByName(
      this.props.goalOptions,
      name
    );
    if (goal) {
      this.props.addGoal(goal);
    }
  }

  findGoalByName(goals: Goal[], name: string): Goal | undefined {
    for (var goal of goals) {
      if (goal.name === name) {
        return goal;
      }
    }
  }

  render() {
    return (
      <div className="GoalPicker">
        <GoalSelectorDropdown handleChange={this.handleChange} />
      </div>
    );
  }
}
