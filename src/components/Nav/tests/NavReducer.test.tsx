import * as actions from "../NavActions";
import { navReducer, defaultState } from "../NavReducer";
import { NavState } from "../../../types/nav";
import { MockAction, MOCK_ACTION_TYPE } from "./MockAction";
import { BaseGoal, Goal } from "../../../types/goals";

it("Should return the current state", () => {
  const state: NavState = {
    ...defaultState
  };

  const newState: NavState = {
    ...defaultState
  };

  const goal: Goal = new BaseGoal();
  const mockGoalAction: MockAction = {
    type: MOCK_ACTION_TYPE,
    payload: goal
  };

  expect(navReducer(state, mockGoalAction)).toEqual(newState);
});

it("Should change the visible component", () => {
  const state: NavState = {
    ...defaultState
  };

  const goal: Goal = new BaseGoal();

  const changeDisplayAction: actions.ChangeDisplayAction = {
    type: actions.CHANGE_DISPLAY,
    payload: goal
  };

  const newState: NavState = {
    VisibleComponent: changeDisplayAction.payload.display
  };

  expect(navReducer(state, changeDisplayAction)).toEqual(newState);
});

it("Should return the default state", () => {
  const goal: Goal = new BaseGoal();
  const mockGoalAction: MockAction = {
    type: MOCK_ACTION_TYPE,
    payload: goal
  };

  expect(navReducer(undefined, mockGoalAction)).toEqual(defaultState);
});
