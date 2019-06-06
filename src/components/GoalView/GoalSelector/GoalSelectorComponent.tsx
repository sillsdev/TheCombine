import React from "react";

import { Goals } from "../../../types/goals";
import Stack from "../../../types/stack";
import GoalSelectorDropdown from "./GoalSelectorDropdown/";

export interface GoalSelectorProps {
  addGoal: (goal: Goals) => void;
  history: Stack<Goals>;
  all: Goals[];
  suggestions: Stack<Goals>;
}

export class GoalSelector extends React.Component<GoalSelectorProps> {
  constructor(props: GoalSelectorProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<{ name?: string; value: unknown }>) {
    let name = event.target.value as string;
    let goal: Goals | undefined = this.findGoalByName(this.props.all, name);
    if (goal) {
      this.props.addGoal(goal);
    }
  }

  findGoalByName(goals: Goals[], name: string): Goals | undefined {
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
