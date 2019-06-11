import * as actions from "../NavActions";
import { navReducer, defaultState } from "../NavReducer";
import { NavState } from "../../../types/nav";
import { MockActionInstance } from "../../../types/action";
import { BaseGoal, Goal } from "../../../types/goals";

it("Should return the current state", () => {
  const state: NavState = {
    ...defaultState
  };

  const newState: NavState = {
    ...defaultState
  };

  expect(navReducer(state, MockActionInstance)).toEqual(newState);
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
  expect(navReducer(undefined, MockActionInstance)).toEqual(defaultState);
});
