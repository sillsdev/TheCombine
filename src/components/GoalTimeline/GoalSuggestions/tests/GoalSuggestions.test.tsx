import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import GoalSuggestions from "components/GoalTimeline/GoalSuggestions";
import { defaultState } from "components/GoalTimeline/DefaultState";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState,
    },
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <GoalSuggestions />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
