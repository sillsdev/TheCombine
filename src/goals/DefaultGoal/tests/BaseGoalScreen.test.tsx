import "jest-canvas-mock";
import React from "react";
import { Provider } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import BaseGoalScreen, { TParams } from "goals/DefaultGoal/BaseGoalScreen";
import { Goal } from "types/goals";

const createMockStore = configureMockStore([thunk]);
const mockStoreState = {
  goalsState: {
    historyState: {
      history: [new Goal()],
    },
  },
};
const mockStore = createMockStore(mockStoreState);
function mockProps(indexString?: number) {
  return {
    match: { params: { id: indexString?.toString() } },
  } as RouteComponentProps<TParams>;
}

describe("BaseGoalScreen", () => {
  it("Renders with no goal index without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen {...mockProps()} />
        </Provider>
      );
    });
  });

  it("Renders with invalid goal index without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen {...mockProps(-1)} />
        </Provider>
      );
    });
  });

  it("Renders with index of default goal without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen {...mockProps(0)} />
        </Provider>
      );
    });
  });
});
