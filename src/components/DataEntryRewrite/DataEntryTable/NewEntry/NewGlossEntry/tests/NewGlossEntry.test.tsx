import React from "react";
import ReactDOM from "react-dom";
import LocalizedNewGlossEntry from "../NewGlossEntry";

describe("Tests NewGlossEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedNewGlossEntry
        glosses={""}
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
      <LocalizedNewGlossEntry
        glosses={""}
        isSpelledCorrectly={false}
        toggleSpellingSuggestionsView={() => null}
        updateGlossField={(newValue: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
