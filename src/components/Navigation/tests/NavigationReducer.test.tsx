import React from "react";
import * as actions from "../NavigationActions";
import {
  navReducer,
  defaultState,
  shouldRenderBackButton
} from "../NavigationReducer";
import { NavState } from "../../../types/nav";
import { MockActionInstance } from "../../../types/action";
import { Goal } from "../../../types/goals";
import BaseGoalScreen from "../../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import { GoalTimeline } from "../../GoalTimeline/GoalTimelineComponent";
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
    VisibleComponentName: navigateForwardAction.payload.display,
    DisplayHistory: [defaultState.VisibleComponentName],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  expect(navReducer(state, navigateForwardAction)).toEqual(newState);
});

it("Should still display the back button after navigating forward again", () => {
  let history = [<GoalTimeline />];

  let visibleGoal: Goal = new CreateCharInv([]);
  let visibleComponent: JSX.Element = visibleGoal.display;

  const state: NavState = {
    VisibleComponentName: visibleComponent,
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
    VisibleComponentName: navigateForwardAction.payload.display,
    DisplayHistory: [...history, visibleComponent],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  expect(navReducer(state, navigateForwardAction)).toEqual(newState);
});

it("Should navigate back to the previous display", () => {
  const previousElement: JSX.Element = <GoalTimeline />;

  const state: NavState = {
    VisibleComponentName: <BaseGoalScreen goal={new CreateCharInv([])} />,
    DisplayHistory: [previousElement],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  const navigateBackAction: actions.NavigateBackAction = {
    type: actions.NAVIGATE_BACK
  };

  const newState: NavState = {
    VisibleComponentName: previousElement,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  expect(navReducer(state, navigateBackAction)).toEqual(newState);
});

it("Should leave the visible display unchanged", () => {
  let visibleComponent = <GoalTimeline />;

  const state: NavState = {
    VisibleComponentName: visibleComponent,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  const navigateBackAction: actions.NavigateBackAction = {
    type: actions.NAVIGATE_BACK
  };

  const newState: NavState = {
    VisibleComponentName: visibleComponent,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  expect(navReducer(state, navigateBackAction)).toEqual(newState);
});

it("Should return true when display history is non-empty", () => {
  const previousDisplay = <GoalTimeline />;
  const displayHistory: JSX.Element[] = [previousDisplay];

  expect(shouldRenderBackButton(displayHistory)).toEqual(true);
});

it("Should return false when display history is empty", () => {
  const displayHistory: JSX.Element[] = [];

  expect(shouldRenderBackButton(displayHistory)).toEqual(false);
});
