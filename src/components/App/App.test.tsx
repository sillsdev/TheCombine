import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../GoalView/TempDefaultState";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);

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
      <App />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
