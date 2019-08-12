import React from "react";
import ReactDOM from "react-dom";
import LocalizedExistingVernEntry from "../ExistingVernacular";

describe("Tests ExistingVernEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedExistingVernEntry
        vernacular=""
        isDuplicate={false}
        toggleDuplicateResolutionView={() => null}
        updateField={(newValue: string) => null}
        updateWord={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("renders without crashing when displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedExistingVernEntry
        vernacular=""
        isDuplicate={true}
        toggleDuplicateResolutionView={() => null}
        updateField={(newValue: string) => null}
        updateWord={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
