import * as actions from "../GoalViewActions";
import {
  addGoalToHistory,
  removeGoalFromSuggestions,
  goalsReducer
} from "../GoalViewReducers";
import { Goal, GoalsState } from "../../../types/goals";
import { TempGoal } from "../../../goals/tempGoal";
import { User } from "../../../types/user";
import Stack from "../../../types/stack";
import { MockGoalAction, MOCK_GOAL } from "./MockAction";

it("Should return the current state", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new TempGoal(user);
  suggestionsArray.push(goal);

  const state: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: new Stack<Goal>(suggestionsArray)
  };

  const newState: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: new Stack<Goal>(suggestionsArray)
  };

  const mockGoalAction: MockGoalAction = {
    type: MOCK_GOAL,
    payload: goal
  };

  expect(goalsReducer(state, mockGoalAction)).toEqual(newState);
});

it("Should add a goal to history and remove it from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const state: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: new Stack<Goal>([])
  };

  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new TempGoal(user);
  suggestionsArray.push(goal);

  const addGoalAction: actions.AddGoalAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  const newState: GoalsState = {
    history: new Stack<Goal>(suggestionsArray),
    goalOptions: [],
    suggestions: new Stack<Goal>([])
  };
  expect(goalsReducer(state, addGoalAction)).toEqual(newState);
});

it("Should add goal to history", () => {
  const state: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: new Stack<Goal>([])
  };

  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new TempGoal(user);
  const newGoalHistory = state.history.makeCopy();
  newGoalHistory.push(goal);
  expect(addGoalToHistory(state, goal)).toEqual(newGoalHistory);
});

it("Should remove next goal from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal1: Goal = new TempGoal(user);
  goal1.name = "Goal 1";

  const goal2: Goal = new TempGoal(user);
  goal2.name = "Goal 2";

  const goal3: Goal = new TempGoal(user);
  goal3.name = "Goal 3";

  suggestionsArray.push(goal1, goal2, goal3);
  const suggestionsStack: Stack<Goal> = new Stack<Goal>(suggestionsArray);

  const state: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: suggestionsStack
  };

  const removedGoal: Goal = new TempGoal(user);
  removedGoal.name = "Goal 2";
  const newGoalSuggestions = state.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(removeGoalFromSuggestions(state, removedGoal)).toEqual(
    newGoalSuggestions
  );
});

it("Should not remove nonexistent goal from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal1: Goal = new TempGoal(user);
  goal1.name = "Goal 1";

  const goal2: Goal = new TempGoal(user);
  goal2.name = "Goal 2";

  const goal3: Goal = new TempGoal(user);
  goal3.name = "Goal 3";

  suggestionsArray.push(goal1, goal2, goal3);
  const suggestionsStack: Stack<Goal> = new Stack<Goal>(suggestionsArray);

  const state: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: suggestionsStack
  };

  const removedGoal: Goal = new TempGoal(user);
  removedGoal.name = "Goal 4";
  const newGoalSuggestions = state.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(removeGoalFromSuggestions(state, removedGoal)).toEqual(
    newGoalSuggestions
  );
});

it("Should not remove last goal from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal1: Goal = new TempGoal(user);
  goal1.name = "Goal 1";

  const goal2: Goal = new TempGoal(user);
  goal2.name = "Goal 2";

  const goal3: Goal = new TempGoal(user);
  goal3.name = "Goal 3";

  suggestionsArray.push(goal1, goal2, goal3);
  const suggestionsStack: Stack<Goal> = new Stack<Goal>(suggestionsArray);

  const state: GoalsState = {
    history: new Stack<Goal>([]),
    goalOptions: [],
    suggestions: suggestionsStack
  };

  const removedGoal: Goal = new TempGoal(user);
  removedGoal.name = "Goal 3";
  const newGoalSuggestions = state.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(removeGoalFromSuggestions(state, removedGoal)).toEqual(
    newGoalSuggestions
  );
});
