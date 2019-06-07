import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import GoalFuture from "../";
import { defaultState } from "../../TempDefaultState";
import { Provider } from "react-redux";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      historyState: {
        history: defaultState.historyState.history
      },
      goalOptions: defaultState.goalOptions,
      suggestionsState: {
        suggestions: defaultState.suggestionsState.suggestions
      }
    }
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <GoalFuture />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
