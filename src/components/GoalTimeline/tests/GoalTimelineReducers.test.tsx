import {
  defaultState,
  emtpyGoalState,
} from "components/GoalTimeline/DefaultState";
import * as actions from "components/GoalTimeline/GoalsActions";
import { goalsReducer } from "components/GoalTimeline/GoalsReducer";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntries";
import { SpellCheckGloss } from "goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "goals/ValidateChars/ValidateChars";
import { StoreAction, StoreActions } from "rootActions";
import { Goal, GoalsState } from "types/goals";

const loadUserEditsAction: actions.GoalAction = {
  type: actions.GoalsActions.LOAD_USER_EDITS,
  payload: [],
};

describe("Test GoalsReducers", () => {
  describe("GoalsActions.ADD_GOAL_TO_HISTORY", () => {
    it("Should add a goal to history, set as currentGoal, and remove it from suggestions", () => {
      const goal: Goal = new CreateCharInv();
      const mockGoalTypeSuggestions = [goal.goalType];
      const mockHistory = [goal];

      const state: GoalsState = {
        ...emtpyGoalState(),
        goalTypeSuggestions: mockGoalTypeSuggestions,
      };

      const addGoalAction: actions.GoalAction = {
        type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
        payload: goal,
      };
      const newState: GoalsState = {
        ...emtpyGoalState(),
        currentGoal: goal,
        history: mockHistory,
      };
      expect(goalsReducer(state, addGoalAction)).toEqual(newState);
    });

    it("Should add a goal to history and set as current goal, and leave suggestions alone if not there", () => {
      const goal: Goal = new CreateCharInv();
      const mockGoalTypeSuggestions = [goal.goalType];

      const state: GoalsState = {
        ...emtpyGoalState(),
        goalTypeSuggestions: mockGoalTypeSuggestions,
      };

      const chosenGoal: Goal = new HandleFlags();

      const addGoalAction: actions.GoalAction = {
        type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
        payload: chosenGoal,
      };
      const newState: GoalsState = {
        ...emtpyGoalState(),
        currentGoal: chosenGoal,
        goalTypeSuggestions: mockGoalTypeSuggestions,
        history: [chosenGoal],
      };
      expect(goalsReducer(state, addGoalAction)).toEqual(newState);
    });
  });

  describe("GoalsActions.LOAD_USER_EDITS", () => {
    it("Should return the default state", () => {
      expect(goalsReducer(undefined, loadUserEditsAction)).toEqual(
        defaultState
      );
    });

    it("Should set the goal history to the payload and leave everything else unchanged", () => {
      const goal: Goal = new CreateCharInv();
      const goal2: Goal = new MergeDups();
      const goal3: Goal = new ReviewEntries();
      const goal4: Goal = new SpellCheckGloss();
      const mockGoalTypeSuggestions = [goal3.goalType, goal4.goalType];
      const mockHistory = [goal, goal2];

      const state: GoalsState = {
        ...emtpyGoalState(),
        goalTypeSuggestions: mockGoalTypeSuggestions,
        history: mockHistory,
      };

      const goal6: Goal = new HandleFlags();
      const goal7: Goal = new ValidateChars();

      const loadUserEditsAction: actions.GoalAction = {
        type: actions.GoalsActions.LOAD_USER_EDITS,
        payload: [goal6, goal7],
      };

      const newState: GoalsState = {
        ...emtpyGoalState(),
        goalTypeSuggestions: mockGoalTypeSuggestions,
        history: [goal6, goal7],
      };

      expect(goalsReducer(state, loadUserEditsAction)).toEqual(newState);
    });
  });

  describe("GoalsActions.SET_CURRENT_GOAL", () => {
    it("Should replace the current goal with specified goal", () => {
      const currentGoal: Goal = new CreateCharInv();
      const updateGoalAction: actions.GoalAction = {
        type: actions.GoalsActions.SET_CURRENT_GOAL,
        payload: currentGoal,
      };
      const newState: GoalsState = { ...defaultState, currentGoal };
      expect(goalsReducer(defaultState, updateGoalAction)).toEqual(newState);
    });
  });

  describe("GoalsActions.UPDATE_GOAL", () => {
    it("Should replace the goal with an updated version", () => {
      const goal: Goal = new CreateCharInv();
      const goal2: Goal = new MergeDups();
      const goal3: Goal = new ReviewEntries();
      const goal4: Goal = new SpellCheckGloss();
      const mockAllGoalTypesArray = [goal3.goalType, goal4.goalType];
      const mockHistory = [goal, goal2];

      const state: GoalsState = {
        ...emtpyGoalState(),
        allGoalTypes: mockAllGoalTypesArray,
        currentGoal: goal2,
        history: mockHistory,
      };

      const updatedGoal: Goal = Object.assign(goal2);
      updatedGoal.currentStep++;
      const updatedHistory = [goal, updatedGoal];

      const updateGoalAction: actions.GoalAction = {
        type: actions.GoalsActions.UPDATE_GOAL,
        payload: goal2,
      };

      const newState: GoalsState = {
        ...emtpyGoalState(),
        allGoalTypes: mockAllGoalTypesArray,
        currentGoal: updatedGoal,
        history: updatedHistory,
      };

      expect(goalsReducer(state, updateGoalAction)).toEqual(newState);
    });
  });

  describe("StoreActions.RESET", () => {
    it("Should return the default state", () => {
      const state = emtpyGoalState();

      const action: StoreAction = {
        type: StoreActions.RESET,
      };
      expect(goalsReducer(state, action)).toEqual(defaultState);
    });
  });
});
