import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../Temp/TempReducer";
import { Provider } from "react-redux";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore(defaultState);
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <App />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
