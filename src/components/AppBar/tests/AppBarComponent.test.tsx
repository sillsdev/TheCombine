import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState } from "components/App/DefaultState";
import AppBar from "components/AppBar/AppBarComponent";
import { newUser } from "types/user";

const mockGetUser = jest.fn();
const mockUser = newUser();

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
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <MemoryRouter>
            <AppBar />
          </MemoryRouter>
        </Provider>,
      );
    });
  });
});
