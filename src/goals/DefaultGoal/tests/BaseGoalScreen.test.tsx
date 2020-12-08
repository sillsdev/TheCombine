import "jest-canvas-mock";
import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { generateGuid, GoalOption, GoalType } from "../../../types/goals";
import { User } from "../../../types/user";
import { BaseGoalScreen } from "../BaseGoalScreen";

const createMockStore = configureMockStore([thunk]);
const mockStoreState = {
  goalsState: {
    historyState: {
      history: [{ currentStep: 1, numSteps: 5 }],
    },
  },
};
const mockUser: User = new User("TestUser", "TestUsername", "TestPass");
const mockStore = createMockStore(mockStoreState);
const mockGoal = {
  goalType: GoalType.HandleFlags,
  name: "MockGoal",
  user: mockUser,
  steps: [],
  numSteps: 0,
  currentStep: 0,
  data: {},
  completed: false,
  result: GoalOption.Current,
  hash: generateGuid(),
};

describe("BaseGoalScreen", () => {
  it("Renders with goal without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen goal={mockGoal} />
        </Provider>
      );
    });
  });

  it("Renders with no goal without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen />
        </Provider>
      );
    });
  });
});
