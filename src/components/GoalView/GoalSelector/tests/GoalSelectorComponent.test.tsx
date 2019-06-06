import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import configureMockStore from "redux-mock-store";
import GoalSelector from "../";
import { defaultState } from "../../GoalViewReducers";
import { Provider } from "react-redux";

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
        <GoalSelector />
      </Provider>,
      container
    );
  });

  ReactDOM.unmountComponentAtNode(container);
});
