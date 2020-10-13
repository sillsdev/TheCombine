import React from "react";
import renderer from "react-test-renderer";

import { ImmutableExistingData } from "../ImmutableExistingData";

describe("ImmutableExistingData", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(<ImmutableExistingData vernacular={""} gloss={""} />);
    });
  });
});
