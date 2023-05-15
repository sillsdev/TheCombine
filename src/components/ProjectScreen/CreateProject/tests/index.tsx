import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import CreateProject from "components/ProjectScreen/CreateProject";
import i18n from "tests/i18nMock";

const createMockStore = configureMockStore();
const mockState = {
  currentProjectState: { project: {} },
  createProjectState: {
    inProgress: false,
    success: false,
    errorMsg: "",
  },
};
const mockStore = createMockStore(mockState);

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: { value: DATA },
};

let projectMaster: renderer.ReactTestRenderer;
let projectHandle: renderer.ReactTestInstance;

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <I18nextProvider i18n={i18n}>
          <CreateProject />
        </I18nextProvider>
      </Provider>
    );
  });
});

it("errors on empty name", () => {
  renderer.act(() => {
    projectMaster = renderer.create(
      <Provider store={mockStore}>
        <CreateProject />
      </Provider>
    );
  });

  projectHandle = projectMaster.root.findByType(CreateProject);
  const testComponent = projectHandle.instance;

  expect(testComponent.state.error.empty).toBe(false);
  testComponent.setState({ name: "" });
  testComponent.createProject(MOCK_EVENT);
  expect(testComponent.state.error.empty).toBe(true);
});
