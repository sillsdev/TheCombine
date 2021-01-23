import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

import { defaultState } from "components/GoalTimeline/DefaultState";
import GoalHistory from "components/GoalTimeline/GoalHistory";

const createMockStore = configureMockStore([thunk]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState,
    },
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
