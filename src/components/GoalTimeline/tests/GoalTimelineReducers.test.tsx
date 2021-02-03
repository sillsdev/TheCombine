import * as actions from "components/GoalTimeline/GoalsActions";
import { goalsReducer } from "components/GoalTimeline/GoalsReducer";
import { Goal, GoalsState } from "types/goals";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import { defaultState } from "components/GoalTimeline/DefaultState";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntries";
import { SpellCheckGloss } from "goals/SpellCheckGloss/SpellCheckGloss";
import { CreateStrWordInv } from "goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateChars } from "goals/ValidateChars/ValidateChars";
import { StoreAction, StoreActions } from "rootActions";

const loadUserEditsAction: actions.GoalAction = {
  type: actions.GoalsActions.LOAD_USER_EDITS,
  payload: [],
};

describe("Test GoalsReducers", () => {
  it("Should return the default state", () => {
    expect(goalsReducer(undefined, loadUserEditsAction)).toEqual(defaultState);
  });

  it("Should return the default state", () => {
    const state: GoalsState = {
      historyState: {
        history: [],
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: [],
      },
    };

    const action: StoreAction = {
      type: StoreActions.RESET,
    };
    expect(goalsReducer(state, action)).toEqual(defaultState);
  });

  it("Should add a goal to history and remove it from suggestions", () => {
    const goal: Goal = new CreateCharInv();
    const suggestionsArray: Goal[] = [goal];

    const state: GoalsState = {
      historyState: {
        history: [],
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };

    const addGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal],
    };
    const newState: GoalsState = {
      historyState: {
        history: suggestionsArray,
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: [],
      },
    };
    expect(goalsReducer(state, addGoalAction)).toEqual(newState);
  });

  it("Should add a goal to history but not remove any goals from non-existent suggestions", () => {
    const goal: Goal = new CreateCharInv();

    const state: GoalsState = {
      historyState: {
        history: [],
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: [],
      },
    };

    const addGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal],
    };
    const newState: GoalsState = {
      historyState: {
        history: [goal],
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: [],
      },
    };
    expect(goalsReducer(state, addGoalAction)).toEqual(newState);
  });

  it("Should add a goal to history but not remove it from suggestions", () => {
    const goal: Goal = new CreateCharInv();
    const suggestionsArray: Goal[] = [goal];

    const state: GoalsState = {
      historyState: {
        history: [],
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };

    const chosenGoal: Goal = new HandleFlags();

    const addGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [chosenGoal],
    };
    const newState: GoalsState = {
      historyState: {
        history: [chosenGoal],
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };
    expect(goalsReducer(state, addGoalAction)).toEqual(newState);
  });

  it("Should set the goal history to the payload and leave everything else unchanged", () => {
    const goal: Goal = new CreateCharInv();
    const goal2: Goal = new MergeDups();
    const goal3: Goal = new ReviewEntries();
    const goal4: Goal = new SpellCheckGloss();
    const goal5: Goal = new CreateStrWordInv();
    const historyArray: Goal[] = [goal, goal2];
    const allPossibleGoalsArray: Goal[] = [goal3];
    const suggestionsArray: Goal[] = [goal4, goal5];

    const state: GoalsState = {
      historyState: {
        history: historyArray,
      },
      allPossibleGoals: allPossibleGoalsArray,
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };

    const goal6: Goal = new HandleFlags();
    const goal7: Goal = new ValidateChars();

    const loadUserEditsAction: actions.GoalAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: [goal6, goal7],
    };

    const newState: GoalsState = {
      historyState: {
        history: [goal6, goal7],
      },
      allPossibleGoals: allPossibleGoalsArray,
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };

    expect(goalsReducer(state, loadUserEditsAction)).toEqual(newState);
  });

  it("Should replace the most recent goal with an updated version", () => {
    const goal: Goal = new CreateCharInv();
    const goal2: Goal = new ReviewEntries();
    const goal3: Goal = new ReviewEntries();
    const goal4: Goal = new SpellCheckGloss();
    const goal5: Goal = new CreateStrWordInv();
    const historyArray: Goal[] = [goal, goal2];
    const allPossibleGoalsArray: Goal[] = [goal3];
    const suggestionsArray: Goal[] = [goal4, goal5];

    const state: GoalsState = {
      historyState: {
        history: historyArray,
      },
      allPossibleGoals: allPossibleGoalsArray,
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };

    const updatedGoal: Goal = Object.assign(goal2);
    updatedGoal.currentStep++;

    const updatedHistory: Goal[] = [goal, updatedGoal];

    const updateGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: [goal2],
    };

    const newState: GoalsState = {
      historyState: {
        history: updatedHistory,
      },
      allPossibleGoals: allPossibleGoalsArray,
      suggestionsState: {
        suggestions: suggestionsArray,
      },
    };

    expect(goalsReducer(state, updateGoalAction)).toEqual(newState);
  });
});
