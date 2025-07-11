import { ThemeProvider } from "@mui/material/styles";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureMockStore from "redux-mock-store";

import AppBar from "components/AppBar";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";

const mockStore = configureMockStore()(defaultState);

describe("AppBar", () => {
  it("renders", async () => {
    await act(async () => {
      render(
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
