import * as actions from "../GoalTimelineActions";
import { goalsReducer } from "../GoalTimelineReducers";
import { Goal, GoalsState } from "../../../types/goals";
import { MockActionGoalArrayInstance } from "../../../types/mockAction";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import { defaultState } from "../DefaultState";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";
import { ViewFinal } from "../../../goals/ViewFinal/ViewFinal";
import { SpellCheckGloss } from "../../../goals/SpellCheckGloss/SpellCheckGloss";
import { CreateStrWordInv } from "../../../goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateChars } from "../../../goals/ValidateChars/ValidateChars";

it("Should return the default state", () => {
  expect(goalsReducer(undefined, MockActionGoalArrayInstance)).toEqual(
    defaultState
  );
});

it("Should return the default state", () => {
  const state: GoalsState = {
    historyState: {
      history: [...defaultState.historyState.history]
    },
    allPossibleGoals: [...defaultState.allPossibleGoals],
    suggestionsState: {
      suggestions: [...defaultState.suggestionsState.suggestions]
    }
  };

  expect(goalsReducer(state, MockActionGoalArrayInstance)).toEqual(
    defaultState
  );
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

  const addGoalAction: actions.AddGoalToHistoryAction = {
    type: actions.ADD_GOAL_TO_HISTORY,
    payload: [goal]
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

  const addGoalAction: actions.AddGoalToHistoryAction = {
    type: actions.ADD_GOAL_TO_HISTORY,
    payload: [goal]
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

  const addGoalAction: actions.AddGoalToHistoryAction = {
    type: actions.ADD_GOAL_TO_HISTORY,
    payload: [chosenGoal]
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

it("Should load set the goal history to the payload and leave everything else unchanged", () => {
  const goal: Goal = new CreateCharInv([]);
  const goal2: Goal = new MergeDups([]);
  const goal3: Goal = new ViewFinal([]);
  const goal4: Goal = new SpellCheckGloss([]);
  const goal5: Goal = new CreateStrWordInv([]);
  const historyArray: Goal[] = [goal, goal2];
  const allPossibleGoalsArray: Goal[] = [goal3];
  const suggestionsArray: Goal[] = [goal4, goal5];

  const state: GoalsState = {
    historyState: {
      history: historyArray
    },
    allPossibleGoals: allPossibleGoalsArray,
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  const goal6: Goal = new HandleFlags([]);
  const goal7: Goal = new ValidateChars([]);

  const loadUserEditsAction: actions.LoadUserEditsAction = {
    type: actions.LOAD_USER_EDITS,
    payload: [goal6, goal7]
  };

  const newState: GoalsState = {
    historyState: {
      history: [goal6, goal7]
    },
    allPossibleGoals: allPossibleGoalsArray,
    suggestionsState: {
      suggestions: suggestionsArray
    }
  };

  expect(goalsReducer(state, loadUserEditsAction)).toEqual(newState);
});
