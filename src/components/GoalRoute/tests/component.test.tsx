import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { Provider } from "react-redux";
import GoalRoute from "../";
import { MemoryRouter } from "react-router";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    ...defaultState
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={["/goals"]} initialIndex={0}>
        <GoalRoute />
      </MemoryRouter>
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
