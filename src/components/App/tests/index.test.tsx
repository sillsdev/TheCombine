import { ThemeProvider } from "@mui/material/styles";
import { act, render } from "@testing-library/react";
import "jest-canvas-mock";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import App from "components/App";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";

jest.mock("react-router-dom");

const mockStore = configureMockStore()(defaultState);

// Need window.innerHeight defined for LandingPage.
global.innerHeight = 100;

describe("App", () => {
  it("renders without crashing", async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <App />
          </Provider>
        </ThemeProvider>
      );
    });
  });
});
