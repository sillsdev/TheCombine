import React from "react";
import ReactDOM from "react-dom";
import { ImmutableExistingEntry } from "../ImmutableExistingEntry";

jest.mock("../ExistingVernEntry/ExistingVernEntry");
jest.mock("../ExistingGlossEntry/ExistingGlossEntry");
jest.mock("../DeleteEntry/DeleteEntry");

describe("Tests ExistingEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(<ImmutableExistingEntry vernacular={""} gloss={""} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
