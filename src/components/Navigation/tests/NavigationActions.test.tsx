import * as actions from "../NavigationActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

it("should create an action to navigate back", () => {
  const expectedAction = {
    type: actions.NAVIGATE_BACK
  };
  expect(actions.navigateBack()).toEqual(expectedAction);
});

it("should create an action to navigate forwards", () => {
  const goal: Goal = new CreateCharInv([]);
  const expectedAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goal
  };
  expect(actions.navigateForward(goal)).toEqual(expectedAction);
});
