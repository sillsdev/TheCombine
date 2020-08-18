import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import DomainCell from "../DomainCell";
import mockWords from "../../tests/MockWords";
import { defaultState } from "../../../../../components/App/DefaultState";
import { Provider } from "react-redux";

const createMockStore = configureMockStore([]);

describe("Tests the DomainCell", () => {
  const mockStore = createMockStore(defaultState);
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <DomainCell
          rowData={mockWords[0]}
          selectedDomain={mockWords[0].senses[0].domains[0]}
        />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
