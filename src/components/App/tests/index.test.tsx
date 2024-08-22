import { render } from "@testing-library/react";
import "jest-canvas-mock";
import { act } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import App from "components/App";
import { defaultState } from "rootRedux/types";

jest.mock("react-router-dom");

const createMockStore = configureMockStore([thunk]);
const mockStore = createMockStore(defaultState);

// Need window.innerHeight defined for LandingPage.
global.innerHeight = 100;
// Mock the track method of segment analytics.
global.analytics = { track: jest.fn() } as any;

describe("App", () => {
  it("renders without crashing", async () => {
    await act(async () => {
      render(
        <Provider store={mockStore}>
          <App />
        </Provider>
      );
    });
  });
});
