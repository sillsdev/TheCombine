import * as actions from "../NavigationActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

it("should create an action to change the visible component", () => {
  const goal: Goal = new CreateCharInv([]);
  const expectedAction: actions.NavigationAction = {
    type: actions.CHANGE_VISIBLE_COMPONENT,
    payload: goal
  };
  expect(actions.changeVisibleComponent(goal)).toEqual(expectedAction);
});
