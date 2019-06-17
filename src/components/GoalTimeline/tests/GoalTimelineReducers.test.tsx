import * as actions from "../GoalTimelineActions";
import {
  addGoalToHistory,
  removeGoalFromSuggestions,
  goalsReducer
} from "../GoalTimelineReducers";
import { Goal, GoalsState } from "../../../types/goals";
import Stack from "../../../types/stack";
import { MockActionInstance } from "../../../types/action";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";
import { SpellCheckGloss } from "../../../goals/SpellCheckGloss/SpellCheckGloss";

it("Should return the current state", () => {
  const goal: Goal = new CreateCharInv([]);
  const suggestionsArray: Goal[] = [goal];

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
  const state: GoalsState = {
    historyState: {
      history: new Stack<Goal>([])
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: new Stack<Goal>([])
    }
  };

  const goal: Goal = new CreateCharInv([]);
  const suggestionsArray: Goal[] = [goal];

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

  const goal: Goal = new CreateCharInv([]);
  const newGoalHistory = state.historyState.history.makeCopy();
  newGoalHistory.push(goal);
  expect(addGoalToHistory(state.historyState.history, goal)).toEqual(
    newGoalHistory
  );
});

it("Should remove next goal from suggestions", () => {
  const goal1: Goal = new CreateCharInv([]);
  const goal2: Goal = new HandleFlags([]);
  const goal3: Goal = new MergeDups([]);

  const suggestionsArray: Goal[] = [goal1, goal2, goal3];
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

  const removedGoal: Goal = new HandleFlags([]);
  const newGoalSuggestions = state.suggestionsState.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});

it("Should not remove nonexistent goal from suggestions", () => {
  const goal1: Goal = new CreateCharInv([]);
  const goal2: Goal = new HandleFlags([]);
  const goal3: Goal = new MergeDups([]);

  const suggestionsArray: Goal[] = [goal1, goal2, goal3];
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

  const removedGoal: Goal = new SpellCheckGloss([]);
  const newGoalSuggestions = state.suggestionsState.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});

it("Should not remove last goal from suggestions", () => {
  const goal1: Goal = new CreateCharInv([]);
  const goal2: Goal = new HandleFlags([]);
  const goal3: Goal = new MergeDups([]);

  const suggestionsArray: Goal[] = [goal1, goal2, goal3];
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

  const removedGoal: Goal = new MergeDups([]);
  const newGoalSuggestions = state.suggestionsState.suggestions.makeCopy();
  newGoalSuggestions.stack.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});
