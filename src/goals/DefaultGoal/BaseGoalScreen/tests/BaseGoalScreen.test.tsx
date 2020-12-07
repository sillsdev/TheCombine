//import "jest-canvas-mock";
import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { Goal } from "../../../../types/goals";
import { User } from "../../../../types/user";
import { MergeDups } from "../../../MergeDupGoal/MergeDups";
import { ValidateChars } from "../../../ValidateChars/ValidateChars";
import BaseGoalScreen from "../BaseGoalScreen";

//jest.mock("../../../MergeDupGoal/MergeDups");
//jest.mock("../../../ValidateChars/ValidateChars");

const createMockStore = configureMockStore([thunk]);
const mockStoreState = {
  mergeDuplicateGoal: {
    data: {
      words: {},
      senses: {},
    },
    tree: {
      senses: {},
      words: {},
    },
  },
  goalsState: {
    historyState: {
      history: [{ currentStep: 1, numSteps: 5 }],
    },
  },
};
const mockUser: User = new User("TestUser", "TestUsername", "TestPass");
const mockStore = createMockStore(mockStoreState);

describe("BaseGoalScreen", () => {
  it("Renders with MergeDups goal without crashing", () => {
    const goal: Goal = new MergeDups();
    goal.user = mockUser;
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen goal={goal} />
        </Provider>
      );
    });
  });

  it("Renders with ValidateChars goal without crashing", () => {
    const goal: Goal = new ValidateChars();
    goal.user = mockUser;
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen goal={goal} />
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
