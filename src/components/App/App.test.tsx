import "jest-canvas-mock";
import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import renderer from "react-test-renderer";
import thunk from "redux-thunk";

import App from "components/App/component";
import { defaultState } from "components/App/DefaultState";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha'ed</div>
));

const createMockStore = configureMockStore([thunk]);
const mockStore = createMockStore(defaultState);

describe("App", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </Provider>
      );
    });
  });
});
