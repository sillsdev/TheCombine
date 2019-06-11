import * as actions from "../NavActions";
import { Goal } from "../../../types/goals";
import { BaseGoal } from "../../../types/goals";
import { User } from "../../../types/user";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../NavReducer";
import thunk from "redux-thunk";

it("should create an action to change the display", () => {
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new BaseGoal();
  goal.user = user;
  const expectedAction = {
    type: actions.CHANGE_DISPLAY,
    payload: goal
  };
  expect(actions.changeDisplay(goal)).toEqual(expectedAction);
});

const createMockStore = configureMockStore([thunk]);

it("should create an async action to change the display", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState
    }
  });

  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new BaseGoal();
  goal.user = user;
  const expectedAction = {
    type: actions.CHANGE_DISPLAY,
    payload: goal
  };

  mockStore.dispatch<any>(actions.asyncChangeDisplay(goal)).then(() => {
    expect(mockStore.getActions()).toEqual([expectedAction]);
  });
});
