import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSwitcher from "./GoalSwitcher";
import GoalSuggestions from "./GoalSuggestions";

/*
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
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
