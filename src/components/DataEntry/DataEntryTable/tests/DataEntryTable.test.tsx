import React from "react";
import ReactDOM from "react-dom";
import DataEntryTable from "../DataEntryTable";
import SemanticDomain from "../../../TreeView/SemanticDomain";
import { mockDomainTree } from "../../tests/MockDomainTree";

const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: "",
  description: "",
  subdomains: []
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
