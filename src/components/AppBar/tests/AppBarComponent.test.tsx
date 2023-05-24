import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Path } from "browserHistory";
import { defaultState } from "components/App/DefaultState";
import AppBar from "components/AppBar/AppBarComponent";
import NavigationButtons from "components/AppBar/NavigationButtons";
import ProjectNameButton from "components/AppBar/ProjectNameButton";
import { newUser } from "types/user";

const mockPath = jest.fn();
const mockGetUser = jest.fn();
const mockUser = newUser();

jest.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mockPath() }),
}));

jest.mock("backend", () => ({
  getUser: () => mockGetUser(),
}));

const mockStore = configureMockStore()(defaultState);

let testRenderer: renderer.ReactTestRenderer;

function setMockFunctions() {
  mockGetUser.mockResolvedValue(mockUser);
}

beforeAll(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("AppBar", () => {
  it("renders without crashing", () => {
    mockPath.mockReturnValue(Path.ProjScreen);
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <AppBar />
        </Provider>
      );
    });
  });
});

describe("NavigationButtons", () => {
  it("has only one tab shaded", () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <NavigationButtons currentTab={Path.DataEntry} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();

    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectNameButton currentTab={Path.Goals} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();

    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectNameButton currentTab={Path.Statistics} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});

describe("ProjectNameButton", () => {
  it("has tab shaded when itself is called", () => {
    mockPath.mockReturnValue(Path.ProjSettings);
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectNameButton currentTab={Path.ProjSettings} />
      </Provider>
    );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});
