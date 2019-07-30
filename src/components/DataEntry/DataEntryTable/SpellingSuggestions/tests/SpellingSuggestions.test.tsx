import React from "react";
import ReactDOM from "react-dom";
import { SpellingSuggestionsView } from "../SpellingSuggestions";

describe("Tests DeleteEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <SpellingSuggestionsView
        mispelledWord={"word"}
        spellingSuggestions={["Word", "Words"]}
        chooseSpellingSuggestion={(suggestions: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
