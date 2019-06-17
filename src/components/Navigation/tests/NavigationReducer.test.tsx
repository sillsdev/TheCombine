import React from "react";
import * as actions from "../NavigationActions";
import {
  navReducer,
  defaultState,
  addDisplayToHistory,
  removeDisplayFromHistory,
  setVisibleToPreviousDisplay,
  shouldRenderBackButton
} from "../NavigationReducer";
import { NavState } from "../../../types/nav";
import { MockActionInstance } from "../../../types/action";
import { Goal } from "../../../types/goals";
import BaseGoalScreen from "../../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import { GoalTimeline } from "../../GoalTimeline/GoalTimelineComponent";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

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
    VisibleComponent: navigateForwardAction.payload.display,
    DisplayHistory: [defaultState.VisibleComponent],
    NavBarState: {
      ShouldRenderBackButton: true
    }
  };

  expect(navReducer(state, navigateForwardAction)).toEqual(newState);
});

it("Should navigate back to the previous display", () => {
  const previousElement: JSX.Element = <GoalTimeline />;

  const state: NavState = {
    VisibleComponent: <BaseGoalScreen goal={new CreateCharInv([])} />,
    DisplayHistory: [previousElement],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  const navigateBackAction: actions.NavigateBackAction = {
    type: actions.NAVIGATE_BACK
  };

  const newState: NavState = {
    VisibleComponent: previousElement,
    DisplayHistory: [],
    NavBarState: {
      ShouldRenderBackButton: false
    }
  };

  expect(navReducer(state, navigateBackAction)).toEqual(newState);
});

it("Should add a goal to the empty display history", () => {
  const currentDisplay: JSX.Element = <GoalTimeline />;
  const displayHistory: JSX.Element[] = [];

  const expectedHistory = [currentDisplay];

  expect(addDisplayToHistory(currentDisplay, displayHistory)).toEqual(
    expectedHistory
  );
});

it("Should remove a goal from the non-empty display history", () => {
  const previousDisplay = <GoalTimeline />;
  const displayHistory: JSX.Element[] = [previousDisplay];

  const expectedHistory: JSX.Element[] = [];

  expect(removeDisplayFromHistory(displayHistory)).toEqual(expectedHistory);
});

it("Should return an empty history given an empty history", () => {
  const displayHistory: JSX.Element[] = [];
  const expectedHistory: JSX.Element[] = [];

  expect(removeDisplayFromHistory(displayHistory)).toEqual(expectedHistory);
});

it("Should set the visible component to the previous display", () => {
  const previousDisplay = <GoalTimeline />;
  const displayHistory: JSX.Element[] = [previousDisplay];

  const currentDisplay = <BaseGoalScreen goal={new CreateCharInv([])} />;
  const expectedDisplay = previousDisplay;
  expect(setVisibleToPreviousDisplay(currentDisplay, displayHistory)).toEqual(
    expectedDisplay
  );
});

it("Should leave the visible display unchanged", () => {
  const currentDisplay = <GoalTimeline />;
  const displayHistory: JSX.Element[] = [];
  const expectedDisplay = <GoalTimeline />;

  expect(setVisibleToPreviousDisplay(currentDisplay, displayHistory)).toEqual(
    expectedDisplay
  );
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
