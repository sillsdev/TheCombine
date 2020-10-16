import React from "react";
import ReactDOM from "react-dom";

import AlignedList from "../AlignedList";

describe("AlignedList", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <AlignedList
        contents={[<div />, <div />]}
        listId={"testId"}
        bottomCell={<div />}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
