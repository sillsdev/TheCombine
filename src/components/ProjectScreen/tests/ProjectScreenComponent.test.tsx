import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import ProjectScreen from "../ProjectScreenComponent";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const state = {
    currentProject: {},
    createProjectState: {
      name: "",
      inProgress: false,
      success: false,
      errorMsg: ""
    }
  };
  const mockStore = createMockStore(state);
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <ProjectScreen />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
