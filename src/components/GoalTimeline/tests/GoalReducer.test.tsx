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
