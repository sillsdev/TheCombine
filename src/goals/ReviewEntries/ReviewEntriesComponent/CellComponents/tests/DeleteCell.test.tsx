import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";
import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";

const createMockStore = configureMockStore([]);

describe("DeleteCell", () => {
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
