import React from "react";

import DeleteCell from "../DeleteCell";
import mockWords from "../../tests/MockWords";
import ReactDOM from "react-dom";

describe("Tests the DomainCell", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DeleteCell rowData={mockWords[0]} delete={jest.fn()} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
