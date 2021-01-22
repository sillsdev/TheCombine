import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import { Goal } from "types/goals";
import BaseGoalSelect from "goals/DefaultGoal/BaseGoalWidget/BaseGoalWidget";

export interface GoalSuggestionsProps {
  suggestions: Goal[];
}

export class GoalSuggestions extends React.Component<
  GoalSuggestionsProps & LocalizeContextProps
> {
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

export default withLocalize(GoalSuggestions);
