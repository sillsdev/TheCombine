import React from "react";
import ReactDOM from "react-dom";
import { ImmutableExistingData } from "../ImmutableExistingData";

describe("Tests ExistingData", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<ImmutableExistingData vernacular={""} gloss={""} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
