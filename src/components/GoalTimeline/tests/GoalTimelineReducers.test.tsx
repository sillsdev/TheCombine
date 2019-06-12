import * as actions from "../GoalTimelineActions";
import {
  addGoalToHistory,
  removeGoalFromSuggestions,
  goalsReducer
} from "../GoalTimelineReducers";
import { Goal, GoalsState } from "../../../types/goals";
import { BaseGoal } from "../../../types/baseGoal";
import { User } from "../../../types/User";
import Stack from "../../../types/stack";
import { MockActionInstance } from "../../../types/action";

it("Should return the current state", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new BaseGoal();
  goal.user = user;
  suggestionsArray.push(goal);

  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: new Stack<Goal>(suggestionsArray)
    }
  };

  const newState: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: new Stack<Goal>(suggestionsArray)
    }
  };

  expect(goalsReducer(state, MockActionInstance)).toEqual(newState);
});

it("Should add a goal to history and remove it from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: new Stack<Goal>([])
    }
  };

  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new BaseGoal();
  goal.user = user;
  suggestionsArray.push(goal);

  const addGoalAction: actions.AddGoalAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  const newState: GoalsState = {
    historyState: {
      history: new Stack<Goal>(suggestionsArray)
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: new Stack<Goal>([])
    }
  };
  expect(goalsReducer(state, addGoalAction)).toEqual(newState);
});

it("Should add goal to history", () => {
  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: new Stack<Goal>([])
    }
  };

  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new BaseGoal();
  goal.user = user;
  const newGoalHistory = state.historyState.history.makeCopy();
  newGoalHistory.push(goal);
  expect(addGoalToHistory(state.historyState.history, goal)).toEqual(
    newGoalHistory
  );
});

it("Should remove next goal from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal1: Goal = new BaseGoal();
  goal1.name = "Goal 1";
  goal1.user = user;

  const goal2: Goal = new BaseGoal();
  goal2.name = "Goal 2";
  goal2.user = user;

  const goal3: Goal = new BaseGoal();
  goal3.name = "Goal 3";
  goal3.user = user;

  suggestionsArray.push(goal1, goal2, goal3);
  const suggestionsStack: Stack<Goal> = new Stack<Goal>(suggestionsArray);

  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsStack
    }
  };

  const removedGoal: Goal = new BaseGoal();
  removedGoal.name = "Goal 2";
  removedGoal.user = user;
  const newGoalSuggestions = state.suggestionsState.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});

it("Should not remove nonexistent goal from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal1: Goal = new BaseGoal();
  goal1.name = "Goal 1";
  goal1.user = user;

  const goal2: Goal = new BaseGoal();
  goal2.name = "Goal 2";
  goal2.user = user;

  const goal3: Goal = new BaseGoal();
  goal3.name = "Goal 3";
  goal3.user = user;

  suggestionsArray.push(goal1, goal2, goal3);
  const suggestionsStack: Stack<Goal> = new Stack<Goal>(suggestionsArray);

  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsStack
    }
  };

  const removedGoal: Goal = new BaseGoal();
  removedGoal.name = "Goal 4";
  removedGoal.user = user;
  const newGoalSuggestions = state.suggestionsState.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});

it("Should not remove last goal from suggestions", () => {
  const suggestionsArray: Goal[] = [];
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal1: Goal = new BaseGoal();
  goal1.name = "Goal 1";
  goal1.user = user;

  const goal2: Goal = new BaseGoal();
  goal2.name = "Goal 2";
  goal2.user = user;

  const goal3: Goal = new BaseGoal();
  goal3.name = "Goal 3";
  goal3.user = user;

  suggestionsArray.push(goal1, goal2, goal3);
  const suggestionsStack: Stack<Goal> = new Stack<Goal>(suggestionsArray);

  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsStack
    }
  };

  const removedGoal: Goal = new BaseGoal();
  removedGoal.name = "Goal 3";
  removedGoal.user = user;
  const newGoalSuggestions = state.suggestionsState.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});
