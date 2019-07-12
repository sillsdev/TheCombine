import * as actions from "../GoalsActions";
import { goalsReducer, updateStepData } from "../GoalsReducer";
import { Goal, GoalsState } from "../../../types/goals";
import { MockActionGoalArrayInstance } from "../../../types/mockAction";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import { defaultState } from "../DefaultState";
import { MergeDups, MergeDupData } from "../../../goals/MergeDupGoal/MergeDups";
import { ViewFinal } from "../../../goals/ViewFinal/ViewFinal";
import { SpellCheckGloss } from "../../../goals/SpellCheckGloss/SpellCheckGloss";
import { CreateStrWordInv } from "../../../goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateChars } from "../../../goals/ValidateChars/ValidateChars";
import { goalDataMock } from "../../../goals/MergeDupGoal/MergeDupStep/tests/MockMergeDupData";

describe("Test GoalsReducers", () => {
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
    const goal: Goal = new CreateCharInv();
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

    const addGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
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
    const goal: Goal = new CreateCharInv();

    const state: GoalsState = {
      historyState: {
        history: []
      },
      allPossibleGoals: [],
      suggestionsState: {
        suggestions: []
      }
    };

    const addGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
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
    const goal: Goal = new CreateCharInv();
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

    const chosenGoal: Goal = new HandleFlags();

    const addGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
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

  it("Should set the goal history to the payload and leave everything else unchanged", () => {
    const goal: Goal = new CreateCharInv();
    const goal2: Goal = new MergeDups();
    const goal3: Goal = new ViewFinal();
    const goal4: Goal = new SpellCheckGloss();
    const goal5: Goal = new CreateStrWordInv();
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

    const goal6: Goal = new HandleFlags();
    const goal7: Goal = new ValidateChars();

    const loadUserEditsAction: actions.GoalAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
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

  it("Should update a goal when navigating to the next step", () => {
    const goal: Goal = new CreateCharInv();
    const goalToEdit: Goal = new MergeDups();
    goalToEdit.data = goalDataMock;
    const goal3: Goal = new ViewFinal();
    const goal4: Goal = new SpellCheckGloss();
    const goal5: Goal = new CreateStrWordInv();
    const historyArray: Goal[] = [goal, goalToEdit];
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

    const nextStepAction: actions.GoalAction = {
      type: actions.GoalsActions.NEXT_STEP,
      payload: []
    };

    const updatedGoalToEdit: Goal = new MergeDups();
    updatedGoalToEdit.hash = goalToEdit.hash;
    updatedGoalToEdit.data = goalDataMock;
    updatedGoalToEdit.steps[updatedGoalToEdit.currentStep] = {
      words: (updatedGoalToEdit.data as MergeDupData).plannedWords[
        updatedGoalToEdit.currentStep
      ]
    };
    updatedGoalToEdit.currentStep = updatedGoalToEdit.currentStep + 1;
    const updatedHistoryArray: Goal[] = [goal, updatedGoalToEdit];

    const newState: GoalsState = {
      historyState: {
        history: updatedHistoryArray
      },
      allPossibleGoals: allPossibleGoalsArray,
      suggestionsState: {
        suggestions: suggestionsArray
      }
    };

    const actualNewState: GoalsState = goalsReducer(state, nextStepAction);

    expect(actualNewState).toEqual(newState);
    expect(goalToEdit).toEqual(updatedGoalToEdit);
  });

  it("Should replace the most recent goal with an updated version", () => {
    const goal: Goal = new CreateCharInv();
    const goal2: Goal = new ViewFinal();
    const goal3: Goal = new ViewFinal();
    const goal4: Goal = new SpellCheckGloss();
    const goal5: Goal = new CreateStrWordInv();
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

    const updatedGoal: Goal = Object.assign(goal2);
    updatedGoal.currentStep++;

    const updatedHistory: Goal[] = [goal, updatedGoal];

    const updateGoalAction: actions.GoalAction = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: [goal2]
    };

    const newState: GoalsState = {
      historyState: {
        history: updatedHistory
      },
      allPossibleGoals: allPossibleGoalsArray,
      suggestionsState: {
        suggestions: suggestionsArray
      }
    };

    expect(goalsReducer(state, updateGoalAction)).toEqual(newState);
  });

  it("Should update the step data of a goal", () => {
    const goal: MergeDups = new MergeDups();
    goal.data = goalDataMock;
    expect(goal.data).toEqual(goalDataMock);
    expect(goal.steps).toEqual([]);
    expect(goal.currentStep).toEqual(0);

    const updatedGoal: MergeDups = updateStepData(goal) as MergeDups;

    expect(updatedGoal.data).toEqual(goal.data);
    expect(updatedGoal.steps[0].words).toEqual(goal.data.plannedWords[0]);
    expect(updatedGoal.currentStep).toEqual(1);
  });
});
