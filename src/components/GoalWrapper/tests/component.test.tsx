import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { Provider } from "react-redux";
import GoalWrapper from "../component";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    ...defaultState
  });
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <GoalWrapper goal={new CreateCharInv([])} />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
