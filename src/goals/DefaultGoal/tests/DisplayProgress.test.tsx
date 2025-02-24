import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import { MergeDups } from "goals/MergeDuplicates/MergeDupsTypes";
import { Goal } from "types/goals";

const createMockStore = configureMockStore();
let mockStore = createMockStore();
function createMockStoreWithGoal(goal: Goal): void {
  const mockStoreState = { goalsState: { currentGoal: goal } };
  mockStore = createMockStore(mockStoreState);
}

describe("DisplayProgress", () => {
  it("Renders with default goal without crashing", async () => {
    createMockStoreWithGoal(new Goal());
    await act(async () => {
      render(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });

  it("Renders with multi-step goal without crashing", async () => {
    createMockStoreWithGoal(new MergeDups());
    await act(async () => {
      render(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });
});
