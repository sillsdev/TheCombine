import * as actions from "../GoalTimelineActions";
import {
  addGoalToHistory,
  removeGoalFromSuggestions,
  goalsReducer
} from "../GoalTimelineReducers";
import { Goal, GoalsState } from "../../../types/goals";
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
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const newState: GoalsState = {
    historyState: {
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  expect(goalsReducer(state, MockActionInstance)).toEqual(newState);
});

it("Should add a goal to history and remove it from suggestions", () => {
  const state: GoalsState = {
    historyState: {
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: []
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
      history: suggestionsArray
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: []
    }
  };
  expect(goalsReducer(state, addGoalAction)).toEqual(newState);
});

it("Should add goal to history", () => {
  const state: GoalsState = {
    historyState: {
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: []
    }
  };

  const goal: Goal = new CreateCharInv([]);
  const newGoalHistory = state.historyState.history;
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
  const suggestionsStack: Goal[] = suggestionsArray;

  const state: GoalsState = {
    historyState: {
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsStack
    }
  };

  const removedGoal: Goal = new HandleFlags([]);
  const newGoalSuggestions = state.suggestionsState.suggestions;
  newGoalSuggestions.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});

it("Should not remove nonexistent goal from suggestions", () => {
  const goal1: Goal = new CreateCharInv([]);
  const goal2: Goal = new HandleFlags([]);
  const goal3: Goal = new MergeDups([]);

  const suggestionsArray: Goal[] = [goal1, goal2, goal3];

  const state: GoalsState = {
    historyState: {
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const removedGoal: Goal = new SpellCheckGloss([]);
  const newGoalSuggestions = state.suggestionsState.suggestions;
  newGoalSuggestions.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});

it("Should not remove last goal from suggestions", () => {
  const goal1: Goal = new CreateCharInv([]);
  const goal2: Goal = new HandleFlags([]);
  const goal3: Goal = new MergeDups([]);

  const suggestionsArray: Goal[] = [goal1, goal2, goal3];

  const state: GoalsState = {
    historyState: {
      history: []
    },
    goalOptions: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const removedGoal: Goal = new MergeDups([]);
  const newGoalSuggestions = state.suggestionsState.suggestions;
  newGoalSuggestions.filter(goal => goal1.name != goal.name);
  expect(
    removeGoalFromSuggestions(state.suggestionsState.suggestions, removedGoal)
  ).toEqual(newGoalSuggestions);
});
