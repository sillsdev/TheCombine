import * as actions from "../GoalTimelineActions";
import { Goal } from "../../../types/goals";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../DefaultState";
import thunk from "redux-thunk";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

it("should create an action to add a goal", () => {
  const goal: Goal = new CreateCharInv([]);
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
  const goal: Goal = new CreateCharInv([]);
  const expectedAction = {
    type: actions.ADD_GOAL,
    payload: goal
  };

  mockStore.dispatch<any>(actions.asyncAddGoalToHistory(goal)).then(() => {
    expect(mockStore.getActions()).toEqual([expectedAction]);
  });
});
