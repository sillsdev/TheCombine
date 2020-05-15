import { GoalSuggestionsState } from "../../../types/goals";
import GoalSuggestions from "./GoalSuggestionsComponent";

import { connect } from "react-redux";
import { StoreState } from "../../../types";

export function mapStateToProps(state: StoreState): GoalSuggestionsState {
  return {
    suggestions: state.goalsState.suggestionsState.suggestions,
  };
}

export default connect(mapStateToProps)(GoalSuggestions);
