import * as actions from "../GoalTimelineActions";
import { Goal } from "../../../types/goals";
import { BaseGoal } from "../../../types/baseGoal";
import { User } from "../../../types/user";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../DefaultState";
import thunk from "redux-thunk";

it("should create an action to add a goal", () => {
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goal = new BaseGoal();
  goal.user = user;
  const expectedAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
});

const createMockStore = configureMockStore([thunk]);

it("should create an async action to add a goal", () => {
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
    type: actions.ADD_GOAL,
    payload: goal
  };

  mockStore.dispatch<any>(actions.asyncAddGoalToHistory(goal)).then(() => {
    expect(mockStore.getActions()).toEqual([expectedAction]);
  });
});
