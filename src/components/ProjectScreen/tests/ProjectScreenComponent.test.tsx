import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ProjectScreen from "components/ProjectScreen/ProjectScreenComponent";

jest.mock("components/AppBar/AppBarComponent", () => "div");

const state = {
  currentProjectState: { project: {} },
  createProjectState: {
    name: "",
    inProgress: false,
    success: false,
    errorMsg: "",
  },
};
const mockStore = configureMockStore()(state);

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ProjectScreen />
      </Provider>
    );
  });
});
