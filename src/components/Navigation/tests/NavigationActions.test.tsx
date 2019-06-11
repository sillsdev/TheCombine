import * as actions from "../NavigationActions";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../NavigationReducer";
import thunk from "redux-thunk";
import { Goal, BaseGoal } from "../../../types/goals";

it("should create an action to navigate back", () => {
  const expectedAction = {
    type: actions.NAVIGATE_BACK
  };
  expect(actions.navigateBack()).toEqual(expectedAction);
});

const createMockStore = configureMockStore([thunk]);

it("should create an async action to navigate back", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState
    }
  });

  const expectedAction = {
    type: actions.NAVIGATE_BACK
  };

  mockStore.dispatch<any>(actions.asyncNavigateBack()).then(() => {
    expect(mockStore.getActions()).toEqual([expectedAction]);
  });
});

it("should create an action to navigate forwards", () => {
  const goal: Goal = new BaseGoal();
  const expectedAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goal
  };
  expect(actions.navigateForward(goal)).toEqual(expectedAction);
});

it("should create an async action to navigate forwards", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState
    }
  });

  const goal: Goal = new BaseGoal();
  const expectedAction = {
    type: actions.NAVIGATE_FORWARD,
    payload: goal
  };

  mockStore.dispatch<any>(actions.asyncNavigateForward(goal)).then(() => {
    expect(mockStore.getActions()).toEqual([expectedAction]);
  });
});
