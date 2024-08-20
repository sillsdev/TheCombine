import { ThemeProvider } from "@mui/material/styles";
import "jest-canvas-mock";
import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { defaultState } from "components/App/DefaultState";
import App from "components/App/component";
import theme from "types/theme";

jest.mock("react-router-dom");

jest.mock("components/AnnouncementBanner/AnnouncementBanner", () => "div");

const createMockStore = configureMockStore([thunk]);
const mockStore = createMockStore(defaultState);

// Need window.innerHeight defined for LandingPage.
global.innerHeight = 100;
// Mock the track method of segment analytics.
global.analytics = { track: jest.fn() } as any;

describe("App", () => {
  it("renders without crashing", async () => {
    await act(async () => {
      create(
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <App />
          </Provider>
        </ThemeProvider>
      );
    });
  });
});
