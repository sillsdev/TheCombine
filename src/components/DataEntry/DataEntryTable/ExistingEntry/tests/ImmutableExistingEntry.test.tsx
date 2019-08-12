import React from "react";
import ReactDOM from "react-dom";
import { ImmutableExistingEntry } from "../ImmutableExistingEntry";

jest.mock("../ExistingVernacular/ExistingVernacular");
jest.mock("../ExistingGloss/ExistingGloss");
jest.mock("../DeleteEntry/DeleteEntry");

describe("Tests ExistingEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<ImmutableExistingEntry vernacular={""} gloss={""} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
