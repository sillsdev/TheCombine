import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import CreateProjectComponent from "../index";
import renderer from "react-test-renderer";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
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

  renderer.create(
    <Provider store={mockStore}>
      <CreateProjectComponent />
    </Provider>
  );
});

it("errors on empty name", () => {
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

  const testRenderer = renderer.create(
    <Provider store={mockStore}>
      <CreateProjectComponent />
    </Provider>
  );
});
