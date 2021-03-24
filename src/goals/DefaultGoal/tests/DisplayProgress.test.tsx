import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { Goal } from "types/goals";

const createMockStore = configureMockStore([thunk]);
let mockStore = createMockStore({});
function createMockStoreWithGoal(goal: Goal) {
  const mockStoreState = { goalsState: { currentGoal: goal } };
  mockStore = createMockStore(mockStoreState);
}

describe("DisplayProgress", () => {
  it("Renders with default goal without crashing", () => {
    createMockStoreWithGoal(new Goal());
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });

  it("Renders with multi-step goal without crashing", () => {
    createMockStoreWithGoal(new MergeDups());
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });
});
