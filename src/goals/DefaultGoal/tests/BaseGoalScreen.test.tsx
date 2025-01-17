import "jest-canvas-mock";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { BaseGoalScreen } from "goals/DefaultGoal/BaseGoalScreen";
import { Goal } from "types/goals";

const createMockStore = configureMockStore();
const mockStoreState = { goalsState: { currentGoal: new Goal() } };
const mockStore = createMockStore(mockStoreState);

jest.mock("components/PageNotFound/component", () => "div");

describe("BaseGoalScreen", () => {
  it("Renders with default goal without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <BaseGoalScreen />
        </Provider>
      );
    });
  });
});
