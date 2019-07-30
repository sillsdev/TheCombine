import React from "react";
import ReactDOM from "react-dom";
import DataEntryTable from "../DataEntryTable";
import SpellChecker from "../../spellChecker";
import { SemanticDomain } from "../../../../types/word";
import { mockDomainTree } from "../../tests/MockDomainTree";

const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: ""
};

describe("Tests DataEntryTable", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DataEntryTable
        domain={mockDomainTree}
        spellChecker={new SpellChecker()}
        semanticDomain={mockSemanticDomain}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
