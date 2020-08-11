import React from "react";
import ReactDOM from "react-dom";
import LocalizedNewVernEntry from "../NewVernEntry";

describe("Tests NewVernEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedNewVernEntry
        vernacular={""}
        vernInput={React.createRef<HTMLDivElement>()}
        updateVernField={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
