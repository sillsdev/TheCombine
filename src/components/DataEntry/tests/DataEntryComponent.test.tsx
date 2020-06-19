import React from "react";
import ReactDOM from "react-dom";
import DataEntryComponent from "../DataEntryComponent";
import { baseDomain } from "../../../types/SemanticDomain";

jest.mock("../DataEntryHeader/DataEntryHeader");
jest.mock("../DataEntryTable/DataEntryTable");
jest.mock("../../TreeView");

describe("Tests DataEntryComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DataEntryComponent domain={baseDomain} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
