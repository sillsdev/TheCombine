import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState } from "components/App/DefaultState";
import AppBar from "components/AppBar/AppBarComponent";

jest.mock("backend", () => ({
  isSiteAdmin: () => mockIsSiteAdmin(),
}));

const mockIsSiteAdmin = jest.fn();
const mockStore = configureMockStore()(defaultState);

function setMockFunctions(): void {
  mockIsSiteAdmin.mockResolvedValue(false);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("AppBar", () => {
  it("renders", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore}>
          <MemoryRouter>
            <AppBar />
          </MemoryRouter>
        </Provider>
      );
    });
  });
});
