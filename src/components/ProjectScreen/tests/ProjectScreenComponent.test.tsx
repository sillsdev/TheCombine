import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import ProjectScreen from "../ProjectScreenComponent";
import renderer from "react-test-renderer";
import CreateProjectComponent from "../CreateProject/CreateProjectComponent";

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

it("errors on empty name", () => {
  const testRenderer = renderer.create(
    <Provider store={mockStore}>
      <ProjectScreen />
    </Provider>
  );
  const testInstance = testRenderer.root;
  testInstance.findByType(CreateProjectComponent);
});
