import React from "react";
import ReactDOM from "react-dom";

import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";
import SenseCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";

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
