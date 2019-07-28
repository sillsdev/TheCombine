import React from "react";
import ReactDOM from "react-dom";
import LocalizedExistingGlossEntry from "../ExistingGlossEntry";

describe("Tests ExistingGlossEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedExistingGlossEntry
        glosses=""
        isSpelledCorrectly={true}
        toggleSpellingSuggestionsView={() => null}
        updateGlossField={(newValue: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("renders without crashing when displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedExistingGlossEntry
        glosses=""
        isSpelledCorrectly={false}
        toggleSpellingSuggestionsView={() => null}
        updateGlossField={(newValue: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
