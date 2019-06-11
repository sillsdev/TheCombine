import { GoalsState, BaseGoal } from "../../types/goals";
import Stack from "../../types/stack";
import { Goal } from "../../types/goals";
import { ADD_GOAL, ActionWithPayload } from "./GoalTimelineActions";
import { User } from "../../types/user";

const tempUser: User = {
  name: "Chewbacca",
  username: "WUUAHAHHHAAAAAAAAAA",
  id: 1
};

let allTheGoals: Goal[] = [];
let goal1: Goal = new BaseGoal();
goal1.id = 1;
goal1.name = "handleDuplicates";
goal1.user = tempUser;
let goal2: Goal = new BaseGoal();
goal2.id = 2;
goal2.name = "handleFlags";
goal2.user = tempUser;
let goal3: Goal = new BaseGoal();
goal3.id = 3;
goal3.name = "grammarCheck";
goal3.user = tempUser;
allTheGoals.push(goal1);
allTheGoals.push(goal2);
allTheGoals.push(goal3);

let suggestionsArray: Goal[] = [];
let suggestion1: Goal = new BaseGoal();
suggestion1.id = 4;
suggestion1.name = "handleDuplicates";
suggestion1.user = tempUser;
let suggestion2: Goal = new BaseGoal();
suggestion2.id = 5;
suggestion2.name = "grammarCheck";
suggestion2.user = tempUser;
suggestionsArray.push(suggestion1);
suggestionsArray.push(suggestion2);

export const defaultState: GoalsState = {
  historyState: {
    history: new Stack<Goal>([])
  },
  goalOptions: allTheGoals,
  suggestionsState: {
    suggestions: new Stack<Goal>(suggestionsArray)
  }
};

export const goalsReducer = (
  state: GoalsState | undefined,
  action: ActionWithPayload<Goal>
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case ADD_GOAL:
      let newHistory = state.historyState.history.makeCopy();
      newHistory = addGoalToHistory(newHistory, action.payload);
      let newSuggestions = state.suggestionsState.suggestions.makeCopy();
      newSuggestions = removeGoalFromSuggestions(
        newSuggestions,
        action.payload
      );
      return {
        historyState: {
          history: newHistory
        },
        goalOptions: state.goalOptions,
        suggestionsState: {
          suggestions: newSuggestions
        }
      };
    default:
      return state;
  }
};

export function addGoalToHistory(
  history: Stack<Goal>,
  goal: Goal
): Stack<Goal> {
  history.push(goal);
  return history;
}

export function removeGoalFromSuggestions(
  suggestions: Stack<Goal>,
  goal: Goal
): Stack<Goal> {
  let nextSuggestion = suggestions.peekFirst();
  if (nextSuggestion && nextSuggestion.name === goal.name) {
    let newSuggestions = new Stack<Goal>(
      suggestions.stack.filter(goal => nextSuggestion.name != goal.name)
    );
    return newSuggestions;
  }
  return suggestions;
}
