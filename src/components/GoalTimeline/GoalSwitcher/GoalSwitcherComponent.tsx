import React from "react";

import { Goal, GoalName } from "../../../types/goals";
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
  handleChange(name: GoalName) {
    let goal: Goal | undefined = this.props.goals.find((g) => g.name === name);
    if (goal) {
      this.props.chooseGoal(goal);
    }
  }

  render() {
    return <GoalSelectorScroll handleChange={this.handleChange} />;
  }
}

export default withLocalize(GoalSwitcher);
