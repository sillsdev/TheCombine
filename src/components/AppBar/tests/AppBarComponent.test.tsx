import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Path } from "browserRouter";
import { defaultState } from "components/App/DefaultState";
import AppBar from "components/AppBar/AppBarComponent";
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
  it("renders", () => {
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
