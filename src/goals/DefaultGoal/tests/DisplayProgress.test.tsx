import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { Goal } from "types/goals";

const createMockStore = configureMockStore([thunk]);
let mockStore = createMockStore({});
function createMockStoreWithGoals(goals: Goal[]) {
  const mockStoreState = {
    goalsState: {
      historyState: {
        history: [...goals],
      },
    },
  };
  mockStore = createMockStore(mockStoreState);
}

describe("DisplayProgress", () => {
  it("Renders with no goal without crashing", () => {
    createMockStoreWithGoals([]);
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });

  it("Renders with default goal without crashing", () => {
    createMockStoreWithGoals([new Goal()]);
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });

  it("Renders with multi-step goal without crashing", () => {
    createMockStoreWithGoals([new MergeDups()]);
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DisplayProgress />
        </Provider>
      );
    });
  });
});
