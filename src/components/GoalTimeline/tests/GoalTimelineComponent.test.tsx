import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../DefaultState";
import { defaultState as selectorState } from "../DefaultState";
import { Provider } from "react-redux";
import { GoalTimeline } from "../GoalTimelineComponent";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      ...defaultState
    },
    goalSelectorState: {
      ...selectorState
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
