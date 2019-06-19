import * as actions from "../NavigationActions";
import {
  navReducer,
  defaultState,
  shouldRenderBackButton
} from "../NavigationReducer";
import { NavState } from "../../../types/nav";
import { MockActionInstance } from "../../../types/action";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";

it("Should return the default state", () => {
  expect(navReducer(undefined, MockActionInstance)).toEqual(defaultState);
});

it("Should return the current state given a non-existent action", () => {
  const state: NavState = {
    ...defaultState
  };

  const newState: NavState = {
    ...defaultState
  };

  expect(navReducer(state, MockActionInstance)).toEqual(newState);
});

it("Should change the visible component to the one provided", () => {
  const state: NavState = {
    ...defaultState
  };

  const goal: Goal = new CreateCharInv([]);

  const navigateForwardAction: actions.NavigateForwardAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goal
  };

  const newState: NavState = {
    VisibleComponentId: navigateForwardAction.payload.id,
    DisplayHistory: [defaultState.VisibleComponentId],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  expect(navReducer(state, navigateForwardAction)).toEqual(newState);
});

it("Should still display the back button after navigating forward again", () => {
  let history: string[] = ["0"];

  let visibleGoal: Goal = new CreateCharInv([]);
  let visibleComponentId = visibleGoal.id;

  const state: NavState = {
    VisibleComponentId: visibleComponentId,
    DisplayHistory: history,
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  let goalToAdd: Goal = new HandleFlags([]);

  const navigateForwardAction: actions.NavigateForwardAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goalToAdd
  };

  const newState: NavState = {
    VisibleComponentId: navigateForwardAction.payload.id,
    DisplayHistory: [...history, visibleComponentId],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  expect(navReducer(state, navigateForwardAction)).toEqual(newState);
});

it("Should navigate back to the previous display", () => {
  const previousElementId = "0";

  const state: NavState = {
    VisibleComponentId: "1",
    DisplayHistory: [previousElementId],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  const navigateBackAction: actions.NavigateBackAction = {
    type: actions.NAVIGATE_BACK
  };

  const newState: NavState = {
    VisibleComponentId: previousElementId,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  expect(navReducer(state, navigateBackAction)).toEqual(newState);
});

it("Should leave the visible display unchanged", () => {
  let visibleComponentId = "0";

  const state: NavState = {
    VisibleComponentId: visibleComponentId,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  const navigateBackAction: actions.NavigateBackAction = {
    type: actions.NAVIGATE_BACK
  };

  const newState: NavState = {
    VisibleComponentId: visibleComponentId,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  expect(navReducer(state, navigateBackAction)).toEqual(newState);
});

it("Should return true when display history is non-empty", () => {
  const displayHistory: string[] = ["0"];

  expect(shouldRenderBackButton(displayHistory)).toEqual(true);
});

it("Should return false when display history is empty", () => {
  const displayHistory: string[] = [];

  expect(shouldRenderBackButton(displayHistory)).toEqual(false);
});
