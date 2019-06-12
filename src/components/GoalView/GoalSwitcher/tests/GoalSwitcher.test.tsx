import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../DefaultState";
import { Provider } from "react-redux";
import GoalSwitcher from "..";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState
    }
  });
  const container = document.createElement("div");
  act(() => {
    ReactDOM.render(
      <Provider store={mockStore}>
        <GoalSwitcher />
      </Provider>,
      container
    );
  });

  ReactDOM.unmountComponentAtNode(container);
});
