import React from "react";
import ReactDOM from "react-dom";

import LocalizedVernWithSuggestions from "../VernWithSuggestions";

describe("Tests VernWithSuggestions", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedVernWithSuggestions
        vernacular={""}
        vernInput={React.createRef<HTMLDivElement>()}
        updateVernField={() => null}
        allVerns={[]}
        allWords={[]}
        handleEnter={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
