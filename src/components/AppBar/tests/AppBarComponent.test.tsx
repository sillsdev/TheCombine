import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import AppBar from "components/AppBar/AppBarComponent";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";

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
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <MemoryRouter>
              <AppBar />
            </MemoryRouter>
          </Provider>
        </ThemeProvider>
      );
    });
  });
});
