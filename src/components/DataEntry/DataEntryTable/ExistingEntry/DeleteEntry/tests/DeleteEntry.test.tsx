import React from "react";
import ReactDOM from "react-dom";
import LocalizedDeleteEntry from "../DeleteEntry";

describe("Tests DeleteEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedDeleteEntry entryIndex={0} removeEntry={() => null} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
