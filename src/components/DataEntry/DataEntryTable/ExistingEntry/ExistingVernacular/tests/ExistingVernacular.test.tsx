import React from "react";
import ReactDOM from "react-dom";
import LocalizedExistingVernEntry from "../ExistingVernacular";

describe("Tests ExistingVernEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedExistingVernEntry
        vernacular=""
        updateField={() => null}
        updateWord={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
