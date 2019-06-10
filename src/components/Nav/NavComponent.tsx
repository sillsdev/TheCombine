import React from "react";
import { GoalView } from "../GoalView/GoalView";
import { Goal } from "../../types/goals";

export interface NavComponentProps {
  // defaultDisplay: React.FC;
}

export class NavComponent extends React.Component<NavComponentProps> {
  constructor(props: NavComponentProps) {
    super(props);
  }

  displayGoal(goal: Goal) {
    return (
      <div className={goal.name}>
        <goal.display />
      </div>
    );
  }

  render() {
    return (
      <div className="NavComponent">
        <GoalView displayGoal={this.displayGoal} />
      </div>
    );
  }
}
