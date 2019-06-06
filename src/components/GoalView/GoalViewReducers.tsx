import { GoalsState } from "../../types/goals";
import Stack from "../../types/stack";
import { Goals } from "../../types/goals";
import { ADD_GOAL, AddGoalAction } from "./GoalViewActions";

export const defaultState: GoalsState = {
  history: new Stack<Goals>([]),
  all: [],
  suggestions: new Stack<Goals>([])
};

export const goalsReducer = (
  state: GoalsState | undefined,
  action: AddGoalAction
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case ADD_GOAL:
      let newHistory = addGoalToHistory(state, action.payload);
      let newSuggestions = removeGoalFromSuggestions(state, action.payload);
      return {
        history: newHistory.makeCopy(),
        all: state.all,
        suggestions: newSuggestions.makeCopy()
      };
    default:
      return state;
  }
};

function addGoalToHistory(state: GoalsState, goal: Goals): Stack<Goals> {
  state.history.push(goal);
  return state.history;
}

function removeGoalFromSuggestions(
  state: GoalsState,
  goal: Goals
): Stack<Goals> {
  let nextSuggestion = state.suggestions.peekFirst();
  if (nextSuggestion && nextSuggestion.name === goal.name) {
    let newSuggestions = new Stack<Goals>(
      state.suggestions.stack.filter(goal => nextSuggestion.name != goal.name)
    );
    return newSuggestions;
  }
  return state.suggestions;
}
