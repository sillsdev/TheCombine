import React from "react";
import ReactDOM from "react-dom";
import DataEntryComponent from "../DataEntryComponent";
import { mockDomainTree } from "../tests/MockDomainTree";

jest.mock("../DataEntryHeader/DataEntryHeader");
jest.mock("../DataEntryTable/DataEntryTable");
jest.mock("../../TreeView");

describe("Tests DataEntryComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DataEntryComponent domain={mockDomainTree} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
