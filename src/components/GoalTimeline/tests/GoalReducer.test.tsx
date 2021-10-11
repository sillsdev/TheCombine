import {
  defaultState,
  emptyGoalState,
} from "components/GoalTimeline/DefaultState";
import { goalReducer } from "components/GoalTimeline/Redux/GoalReducer";
import {
  GoalAction,
  GoalActionTypes,
} from "components/GoalTimeline/Redux/GoalReduxTypes";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "goals/HandleFlags/HandleFlags";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntries";
import { SpellCheckGloss } from "goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "goals/ValidateChars/ValidateChars";
import { StoreAction, StoreActionTypes } from "rootActions";
import { Goal, GoalsState } from "types/goals";

describe("GoalReducer", () => {
  describe("GoalActionTypes.LOAD_USER_EDITS", () => {
    it("Should return the default state", () => {
      const loadUserEditsAction: GoalAction = {
        type: GoalActionTypes.LOAD_USER_EDITS,
        payload: [],
      };

      expect(goalReducer(undefined, loadUserEditsAction)).toEqual(defaultState);
    });

    it("Should set the goal history to the payload and leave everything else unchanged", () => {
      const goal: Goal = new CreateCharInv();
      const goal2: Goal = new MergeDups();
      const goal3: Goal = new ReviewEntries();
      const goal4: Goal = new SpellCheckGloss();
      const goalTypeSuggestions = [goal3.goalType, goal4.goalType];
      const history = [goal, goal2];

      const state: GoalsState = {
        ...emptyGoalState(),
        goalTypeSuggestions,
        history,
      };

      const goal6: Goal = new HandleFlags();
      const goal7: Goal = new ValidateChars();

      const loadUserEditsAction: GoalAction = {
        type: GoalActionTypes.LOAD_USER_EDITS,
        payload: [goal6, goal7],
      };

      const newState: GoalsState = {
        ...state,
        history: [goal6, goal7],
      };

      expect(goalReducer(state, loadUserEditsAction)).toEqual(newState);
    });
  });

  describe("GoalActionTypes.SET_CURRENT_GOAL", () => {
    it("Should replace current goal, and remove type from top suggestion", () => {
      const currentGoal: Goal = new CreateCharInv();
      const updateGoalAction: GoalAction = {
        type: GoalActionTypes.SET_CURRENT_GOAL,
        payload: currentGoal,
      };
      const goalTypeSuggestions = defaultState.goalTypeSuggestions.slice();
      if (goalTypeSuggestions[0] === currentGoal.goalType) {
        goalTypeSuggestions.splice(0, 1);
      }
      const newState: GoalsState = {
        ...defaultState,
        currentGoal,
        goalTypeSuggestions,
      };
      expect(goalReducer(defaultState, updateGoalAction)).toEqual(newState);
    });
  });

  describe("StoreActionTypes.RESET", () => {
    it("Should return the default state", () => {
      const state = emptyGoalState();

      const action: StoreAction = {
        type: StoreActionTypes.RESET,
      };
      expect(goalReducer(state, action)).toEqual(defaultState);
    });
  });
});
