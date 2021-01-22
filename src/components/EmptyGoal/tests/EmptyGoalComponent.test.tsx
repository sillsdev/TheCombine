import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import { defaultState } from "components/App/DefaultState";
import EmptyGoalComponent from "components/EmptyGoal/EmptyGoalComponent";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    ...defaultState,
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <EmptyGoalComponent />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
