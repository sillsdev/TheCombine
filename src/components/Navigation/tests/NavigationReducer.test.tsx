import * as actions from "../NavigationActions";
import { navReducer, defaultState } from "../NavigationReducer";
import { NavState } from "../../../types/nav";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

it("Should change the visible component to the one provided", () => {
  const state: NavState = {
    ...defaultState
  };

  const goal: Goal = new CreateCharInv([]);

  const changeVisibleComponentAction: actions.NavigationAction = {
    type: actions.CHANGE_VISIBLE_COMPONENT,
    payload: goal
  };

  const newState: NavState = {
    VisibleComponentId: goal.id,
    NavBarState: {
      Title: goal.name
    }
  };

  expect(navReducer(state, changeVisibleComponentAction)).toEqual(newState);
});

it("Should return the default state when an undefined state is provided", () => {
  const state: NavState = {
    ...defaultState
  };

  const goal: Goal = new CreateCharInv([]);

  const changeVisibleComponentAction: actions.NavigationAction = {
    type: actions.CHANGE_VISIBLE_COMPONENT,
    payload: goal
  };

  expect(navReducer(undefined, changeVisibleComponentAction)).toEqual(state);
});
