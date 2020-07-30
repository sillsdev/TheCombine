import React from "react";
import configureMockStore from "redux-mock-store";
import LocalizedCreateProject, {
  CreateProject,
} from "../CreateProjectComponent";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";

const createMockStore = configureMockStore([]);

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: {
    value: DATA,
  },
};

var projectMaster: ReactTestRenderer;
var projectHandle: ReactTestInstance;

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
  renderer.act(() => {
    renderer.create(
      <LocalizedCreateProject
        inProgress={false}
        success={false}
        errorMsg={""}
        asyncCreateProject={jest.fn()}
        reset={jest.fn()}
      />
    );
  });
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
  renderer.act(() => {
    projectMaster = renderer.create(
      <LocalizedCreateProject
        inProgress={false}
        success={false}
        errorMsg={""}
        asyncCreateProject={jest.fn()}
        reset={jest.fn()}
      />
    );
  });

  projectHandle = projectMaster.root.findByType(CreateProject);
  const testComponent = projectHandle.instance;
  testComponent.setState({ name: "" });
  testComponent.createProject(MOCK_EVENT);
  expect(testComponent.state.error.name).toBe(true);
});
