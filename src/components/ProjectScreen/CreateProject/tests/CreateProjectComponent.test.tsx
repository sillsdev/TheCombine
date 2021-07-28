import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import CreateProjectComponent from "components/ProjectScreen/CreateProject";
import CreateProject from "components/ProjectScreen/CreateProject/CreateProjectComponent";

const createMockStore = configureMockStore([]);
const mockState = {
  currentProject: {},
  createProjectState: {
    name: "",
    inProgress: false,
    success: false,
    errorMsg: "",
  },
};
const mockStore = createMockStore(mockState);

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: {
    value: DATA,
  },
};

let projectMaster: ReactTestRenderer;
let projectHandle: ReactTestInstance;

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <CreateProjectComponent />
      </Provider>
    );
  });
});

it("errors on empty name", () => {
  renderer.act(() => {
    projectMaster = renderer.create(
      <Provider store={mockStore}>
        <CreateProjectComponent />
      </Provider>
    );
  });

  projectHandle = projectMaster.root.findByType(CreateProject);
  let testComponent = projectHandle.instance;

  expect(testComponent.state.error.empty).toBe(false);
  testComponent.setState({ name: "" });
  testComponent.createProject(MOCK_EVENT);
  expect(testComponent.state.error.empty).toBe(true);
});
