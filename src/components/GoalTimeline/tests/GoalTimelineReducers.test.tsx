import * as actions from "../GoalTimelineActions";
import { goalsReducer } from "../GoalTimelineReducers";
import { Goal, GoalsState } from "../../../types/goals";
import { MockActionInstance } from "../../../types/action";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";

it("Should return the current state", () => {
  const goal: Goal = new CreateCharInv([]);
  const suggestionsArray: Goal[] = [goal];

  const state: GoalsState = {
    historyState: {
      history: []
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const newState: GoalsState = {
    historyState: {
      history: []
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  expect(goalsReducer(state, MockActionInstance)).toEqual(newState);
});

it("Should add a goal to history and remove it from suggestions", () => {
  const goal: Goal = new CreateCharInv([]);
  const suggestionsArray: Goal[] = [goal];

  const state: GoalsState = {
    historyState: {
      history: []
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const addGoalAction: actions.AddGoalAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  const newState: GoalsState = {
    historyState: {
      history: suggestionsArray
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: []
    }
  };
  expect(goalsReducer(state, addGoalAction)).toEqual(newState);
});

it("Should add a goal to history but not remove any goals from non-existent suggestions", () => {
  const goal: Goal = new CreateCharInv([]);

  const state: GoalsState = {
    historyState: {
      history: []
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: []
    }
  };

  const addGoalAction: actions.AddGoalAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  const newState: GoalsState = {
    historyState: {
      history: [goal]
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: []
    }
  };
  expect(goalsReducer(state, addGoalAction)).toEqual(newState);
});

it("Should add a goal to history but not remove it from suggestions", () => {
  const goal: Goal = new CreateCharInv([]);
  const suggestionsArray: Goal[] = [goal];

  const state: GoalsState = {
    historyState: {
      history: []
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const chosenGoal: Goal = new HandleFlags([]);

  const addGoalAction: actions.AddGoalAction = {
    type: actions.ADD_GOAL,
    payload: chosenGoal
  };
  const newState: GoalsState = {
    historyState: {
      history: [chosenGoal]
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };
  expect(goalsReducer(state, addGoalAction)).toEqual(newState);
});
