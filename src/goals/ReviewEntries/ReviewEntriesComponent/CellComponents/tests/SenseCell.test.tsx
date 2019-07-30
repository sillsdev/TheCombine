import React from "react";
import ReactDOM from "react-dom";

import SenseCell from "../SenseCell";
import mockWords from "../../tests/MockWords";

describe("Test the AlignedList component", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <SenseCell
        rowData={mockWords[0]}
        value={mockWords[0].senses}
        editable={true}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
