import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureMockStore from "redux-mock-store";

import { Path } from "../../../history";
import { defaultState } from "../../App/DefaultState";
import GoalRoute from "../component";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    ...defaultState,
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[Path.Goals]} initialIndex={0}>
        <GoalRoute />
      </MemoryRouter>
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
