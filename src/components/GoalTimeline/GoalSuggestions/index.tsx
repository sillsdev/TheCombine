import { connect } from "react-redux";

import { StoreState } from "types";
import { GoalSuggestionsState } from "types/goals";
import GoalSuggestions from "components/GoalTimeline/GoalSuggestions/GoalSuggestionsComponent";

export function mapStateToProps(state: StoreState): GoalSuggestionsState {
  return {
    suggestions: state.goalsState.suggestionsState.suggestions,
  };
}

export default connect(mapStateToProps)(GoalSuggestions);
