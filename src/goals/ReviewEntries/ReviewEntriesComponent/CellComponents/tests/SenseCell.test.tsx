import React from "react";
import ReactDOM from "react-dom";

import mockWords from "../../tests/MockWords";
import SenseCell from "../SenseCell";

describe("SenseCell", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <SenseCell
        rowData={mockWords[0]}
        value={mockWords[0].senses}
        editable={true}
        sortingByGloss={true}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
