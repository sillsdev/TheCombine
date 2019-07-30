import React from "react";
import ReactDOM from "react-dom";

import DomainCell from "../DomainCell";
import mockWords from "../../tests/MockWords";

describe("Tests the DomainCell", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DomainCell
        rowData={mockWords[0]}
        selectedDomain={mockWords[0].senses[0].domains[0]}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
