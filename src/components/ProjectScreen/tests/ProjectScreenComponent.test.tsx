import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ProjectScreen from "components/ProjectScreen/ProjectScreenComponent";

jest.mock("components/AppBar/AppBarComponent", () => "div");

const createMockStore = configureMockStore([]);
const state = {
  currentProject: {},
  createProjectState: {
    name: "",
    inProgress: false,
    success: false,
    errorMsg: "",
  },
};
const mockStore = createMockStore(state);

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ProjectScreen />
      </Provider>
    );
  });
});
