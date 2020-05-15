import React from "react";

import { Goal } from "../../../types/goals";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";
import GoalSelectorScroll from "./GoalSelectorScroll";

export interface GoalSwitcherProps {
  chooseGoal: (goal: Goal) => void;
  goals: Goal[];
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
  handleChange(name: string) {
    let goal: Goal | undefined = this.props.goals.find((g) => g.name === name);
    if (goal) {
      this.props.chooseGoal(goal);
    }
  }

  render() {
    return (
      <div className="GoalSwitcher2">
        <GoalSelectorScroll handleChange={this.handleChange} />
      </div>
    );
  }
}

export default withLocalize(GoalSwitcher);
