import React from "react";
import configureMockStore from "redux-mock-store";
import DeleteCell from "../DeleteCell";
import mockWords from "../../tests/MockWords";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { defaultState } from "../../../../../components/App/DefaultState";

const createMockStore = configureMockStore([]);

describe("Tests the DomainCell", () => {
  const mockStore = createMockStore(defaultState);
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <DeleteCell rowData={mockWords[0]} delete={jest.fn()} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
