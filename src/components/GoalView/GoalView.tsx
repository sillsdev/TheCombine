import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSelector from "./GoalSelector";
import GoalFuture from "./GoalFuture";

export class GoalView extends React.Component {
  render() {
    return (
      <div className="GoalView">
        <GoalHistory />
        <GoalSelector />
        <GoalFuture />
      </div>
    );
  }
}
