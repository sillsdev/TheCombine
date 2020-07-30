import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import ProjectScreen from "../ProjectScreenComponent";
import renderer from "react-test-renderer";

jest.mock("../CreateProject/CreateProjectComponent");

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
