import React from "react";

import { Goal } from "../../../types/goals";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

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
        {this.props.suggestions.map(goal => goal.goalWidget)}
      </div>
    );
  }
}

export default withLocalize(GoalSuggestions);
