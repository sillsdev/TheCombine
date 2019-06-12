import React from "react";

import { Goal } from "../../../types/goals";
import GoalSelectorDropdown from "./GoalSelectorDropdown";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

export interface GoalSwitcherProps {
  chooseGoal: (goal: Goal) => void;
  goalOptions: Goal[];
}

/*
 * Holds a component that provides the user with a choice for the next goal
 * they want to work on.
 */
export class GoalSwitcher extends React.Component<
  GoalSwitcherProps & LocalizeContextProps
> {
  constructor(props: GoalSwitcherProps & LocalizeContextProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  // Given a change event, find which goal the user selected, and choose it
  // as the next goal to work on.
  handleChange(event: React.ChangeEvent<{ name?: string; value: unknown }>) {
    let name = event.target.value as string;
    let goal: Goal | undefined = this.findGoalByName(
      this.props.goalOptions,
      name
    );
    if (goal) {
      this.props.chooseGoal(goal);
    }
  }

  // Search through the list of possible goals, and find which one the user
  // selected
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

export default withLocalize(GoalSwitcher);
