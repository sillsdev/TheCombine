import { GoalsState } from "../../types/goals";
import Stack from "../../types/stack";
import { Goals } from "../../types/goals";
import { ADD_GOAL, AddGoalAction } from "./GoalViewActions";
import { User } from "../../types/user";
import { TempGoal } from "../../goals/tempGoal";

const tempUser: User = {
  name: "Chewbacca",
  username: "WUUAHAHHHAAAAAAAAAA",
  id: 1
};

let allTheGoals: Goals[] = [];
let goal1: Goals = new TempGoal(tempUser);
let goal1Message = "A goal";
goal1.id = 1;
goal1.name = "Handle duplicates";
goal1.data = { words: goal1Message.split(" "), step: 1 };
let goal2: Goals = new TempGoal(tempUser);
let goal2Message = "Another goal";
goal2.id = 2;
goal2.name = "Handle flags";
goal2.data = { words: goal2Message.split(" "), step: 2 };
let goal3: Goals = new TempGoal(tempUser);
goal3.name = "Grammar check";
goal3.id = 3;
allTheGoals.push(goal1);
allTheGoals.push(goal2);
allTheGoals.push(goal3);

let suggestionsArray: Goals[] = [];
let suggestion1: Goals = new TempGoal(tempUser);
suggestion1.name = "Handle duplicates";
suggestion1.id = 4;
let suggestion2: Goals = new TempGoal(tempUser);
suggestion2.name = "Grammar check";
suggestion2.id = 5;
suggestionsArray.push(suggestion1);
suggestionsArray.push(suggestion2);

export const defaultState: GoalsState = {
  history: new Stack<Goals>([]),
  all: allTheGoals,
  suggestions: new Stack<Goals>(suggestionsArray)
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
