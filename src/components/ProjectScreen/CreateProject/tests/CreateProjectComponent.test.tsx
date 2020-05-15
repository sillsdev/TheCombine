import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import CreateProjectComponent from "../index";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const state = {
    currentProject: {},
    createProjectState: {
      name: "",
      inProgress: false,
      success: false,
      errorMsg: "",
    },
  };
  const mockStore = createMockStore(state);
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <CreateProjectComponent />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
