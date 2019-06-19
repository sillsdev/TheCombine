import React from "react";

import { Goal } from "../../../types/goals";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import BaseGoalSelect from "../../../goals/DefaultGoal/BaseGoalSelect/BaseGoalSelect";

export interface GoalSuggestionsProps {
  suggestions: Goal[];
}

export class GoalSuggestions extends React.Component<
  GoalSuggestionsProps & LocalizeContextProps
> {
  constructor(props: GoalSuggestionsProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div className="GoalPicker">
        {this.props.suggestions.map(goal => (
          <BaseGoalSelect goal={goal} />
        ))}
      </div>
    );
  }
}

export default withLocalize(GoalSuggestions);
