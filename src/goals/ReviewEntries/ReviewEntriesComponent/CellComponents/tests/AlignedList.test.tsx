import React from "react";
import ReactDOM from "react-dom";

import AlignedList from "../AlignedList";

describe("Test the AlignedList component", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <AlignedList contents={[<div />, <div />]} bottomCell={<div />} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
