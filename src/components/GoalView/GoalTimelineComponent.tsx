import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSwitcher from "./GoalSwitcher";
import GoalSuggestions from "./GoalSuggestions";

export class GoalTimeline extends React.Component {
  render() {
    return (
      <div className="GoalView">
        <GoalHistory />
        <GoalSwitcher />
        <GoalSuggestions />
      </div>
    );
  }
}
