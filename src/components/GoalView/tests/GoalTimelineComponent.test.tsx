import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../GoalTimelineReducers";
import { Provider } from "react-redux";
import { GoalTimeline } from "../GoalTimelineComponent";

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
      <GoalTimeline />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
