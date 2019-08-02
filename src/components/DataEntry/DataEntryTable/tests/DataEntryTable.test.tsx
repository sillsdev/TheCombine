import React from "react";
import ReactDOM from "react-dom";
import DataEntryTable from "../DataEntryTable";
import { mockDomainTree } from "../../tests/MockDomainTree";
import { SemanticDomain } from "../../../../types/word";

export const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: ""
};

describe("Tests DataEntryTable", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DataEntryTable
        domain={mockDomainTree}
        semanticDomain={mockSemanticDomain}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
