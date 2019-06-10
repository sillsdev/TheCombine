import React from "react";
import { Goal } from "../../types/goals";

export interface NavComponentProps {
  displayGoal: (goal: Goal) => void;
  CurrentComponent: JSX.Element;
}

export class NavComponent extends React.Component<NavComponentProps> {
  constructor(props: NavComponentProps) {
    super(props);
  }

  displayGoal(goal: Goal) {
    this.displayGoal(goal);
  }

  render() {
    return <div className="NavComponent">{this.props.CurrentComponent}</div>;
  }
}
