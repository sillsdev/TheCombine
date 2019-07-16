import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import ChooseProjectComponent from "../index";
import { Provider } from "react-redux";
import { Project } from "../../../../types/project";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({} as Project);
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <ChooseProjectComponent />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
