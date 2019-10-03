import React from "react";
import ReactDOM from "react-dom";
import LocalizedNewVernEntry from "../NewVernEntry";

describe("Tests NewVernEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedNewVernEntry
        vernacular={""}
        showAutocompleteToggle={false}
        vernInput={React.createRef<HTMLDivElement>()}
        toggleAutocompleteView={() => null}
        updateVernField={(newValue: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("renders without crashing when displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedNewVernEntry
        vernacular={""}
        showAutocompleteToggle={true}
        vernInput={React.createRef<HTMLDivElement>()}
        toggleAutocompleteView={() => null}
        updateVernField={(newValue: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
