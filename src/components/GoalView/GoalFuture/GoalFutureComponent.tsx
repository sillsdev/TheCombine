import React from "react";

import { Goals } from "../../../types/goals";
import { Stack } from "../../../types/stack";
import { Goal } from "../GoalComponent/GoalComponent";

export interface GoalFutureProps {
  goals: Stack<Goals>;
}

export interface GoalFutureState {}

export class GoalFuture extends React.Component<
  GoalFutureProps,
  GoalFutureState
> {
  constructor(props: GoalFutureProps) {
    super(props);
  }
  render() {
    return (
      <div className="GoalPicker">
        {/* {this.props.goals.stack.map(goal => (
          <Goal key={goal.id} goal={goal} />
        ))} */}
      </div>
    );
  }
}
