import React from "react";

import BaseGoalSelect from "goals/DefaultGoal/BaseGoalWidget/BaseGoalWidget";
import { Goal } from "types/goals";

interface GoalSuggestionsProps {
  suggestions: Goal[];
}

export default class GoalSuggestions extends React.Component<GoalSuggestionsProps> {
  render() {
    return (
      <div className="GoalSuggestions">
        {this.props.suggestions.map((goal) => (
          <BaseGoalSelect key={goal.goalType} goal={goal} />
        ))}
      </div>
    );
  }
}
