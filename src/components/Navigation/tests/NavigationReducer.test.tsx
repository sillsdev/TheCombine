import React from "react";
import * as actions from "../NavigationActions";
import {
  navReducer,
  defaultState,
  addDisplayToHistory,
  removeDisplayFromHistory
} from "../NavigationReducer";
import { NavState } from "../../../types/nav";
import { MockActionInstance } from "../../../types/action";
import { BaseGoal, Goal } from "../../../types/goals";
import Stack from "../../../types/stack";
import BaseGoalScreen from "../../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import { GoalTimeline } from "../../GoalView/GoalTimelineComponent";

it("Should return the default state if state is undefined", () => {
  const expectedState = defaultState;

  const goal: Goal = new BaseGoal();

  const changeDisplayAction: actions.NavigateForwardAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goal
  };

  expect(navReducer(undefined, changeDisplayAction)).toEqual(expectedState);
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

  const goal: Goal = new BaseGoal();

  const changeDisplayAction: actions.NavigateForwardAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goal
  };

  const newState: NavState = {
    VisibleComponent: changeDisplayAction.payload.display,
    DisplayHistory: new Stack<JSX.Element>([defaultState.VisibleComponent])
  };

  expect(navReducer(state, changeDisplayAction)).toEqual(newState);
});

it("Should navigate back to the previous display", () => {
  const previousElement: JSX.Element = <GoalTimeline />;
  const displayHistory: JSX.Element[] = [previousElement];

  const state: NavState = {
    VisibleComponent: <BaseGoalScreen goal={new BaseGoal()} />,
    DisplayHistory: new Stack<JSX.Element>(displayHistory)
  };

  const navigateBackAction: actions.NavigateBackAction = {
    type: actions.NAVIGATE_BACK
  };

  const newState: NavState = {
    VisibleComponent: previousElement,
    DisplayHistory: new Stack<JSX.Element>([])
  };

  expect(navReducer(state, navigateBackAction)).toEqual(newState);
});

it("Should add a goal to the empty display history", () => {
  const currentDisplay: JSX.Element = <GoalTimeline />;
  const displayHistory = new Stack<JSX.Element>([]);

  const expectedHistory = new Stack<JSX.Element>([currentDisplay]);

  expect(addDisplayToHistory(currentDisplay, displayHistory)).toEqual(
    expectedHistory
  );
});

it("Should remove a goal from the non-empty display history", () => {
  const previousDisplay = <GoalTimeline />;
  const displayHistory = new Stack<JSX.Element>([previousDisplay]);

  const expectedHistory = new Stack<JSX.Element>([]);

  expect(removeDisplayFromHistory(displayHistory)).toEqual(expectedHistory);
});

it("Should return an empty history given an empty history", () => {
  const displayHistory = new Stack<JSX.Element>([]);
  const expectedHistory = new Stack<JSX.Element>([]);

  expect(removeDisplayFromHistory(displayHistory)).toEqual(expectedHistory);
});

it("Should return the default state", () => {
  expect(navReducer(undefined, MockActionInstance)).toEqual(defaultState);
});
