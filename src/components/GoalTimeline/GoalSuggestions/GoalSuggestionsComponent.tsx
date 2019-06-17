import React from "react";

import { Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

export interface GoalSuggestionsProps {
  suggestions: Stack<Goal>;
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
        {this.props.suggestions.stack.map(goal => goal.goalWidget)}
      </div>
    );
  }
}

export default withLocalize(GoalSuggestions);
