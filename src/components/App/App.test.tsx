import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../Temp/TempReducer";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    // Missing localize
    tempState: {
      ...defaultState
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
