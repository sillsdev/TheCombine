import "jest-canvas-mock";
import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { mockGoal } from "../../../types/goals";
import { BaseGoalScreen } from "../BaseGoalScreen";

const createMockStore = configureMockStore([thunk]);
const mockStoreState = {
  goalsState: {
    historyState: {
      history: [{ currentStep: 1, numSteps: 5 }],
    },
  },
};
const mockStore = createMockStore(mockStoreState);

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
