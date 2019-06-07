import React from "react";

import { Goal } from "../../../types/goals";
import GoalSelectorDropdown from "./GoalSelectorDropdown/";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface GoalSelectorProps {
  addGoal: (goal: Goal) => void;
  goalOptions: Goal[];
}

export class GoalSelector extends React.Component<
  GoalSelectorProps & LocalizeContextProps
> {
  constructor(props: GoalSelectorProps & LocalizeContextProps) {
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

export default withLocalize(GoalSelector);
