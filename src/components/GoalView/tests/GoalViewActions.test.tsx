import * as actions from "../GoalViewActions";
import { Goals } from "../../../types/goals";
import { TempGoal } from "../../../goals/tempGoal";
import { User } from "../../../types/user";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../GoalView/TempDefaultState";
import thunk from "redux-thunk";

it("should create an action to add a goal", () => {
  const user: User = {
    name: "Test user",
    username: "Test username",
    id: 0
  };
  const goal: Goals = new TempGoal(user);
  const expectedAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  expect(actions.addGoal(goal)).toEqual(expectedAction);
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
  const goal: Goals = new TempGoal(user);
  const expectedAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };

  mockStore.dispatch<any>(actions.asyncAddGoal(goal)).then(() => {
    expect(mockStore.getActions()).toEqual([expectedAction]);
  });
});
