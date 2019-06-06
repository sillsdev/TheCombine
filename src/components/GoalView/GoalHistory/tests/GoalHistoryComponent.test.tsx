import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import GoalHistory from "../";
import { defaultState } from "../../GoalViewReducers";
import { Provider } from "react-redux";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState
    }
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <GoalHistory />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
