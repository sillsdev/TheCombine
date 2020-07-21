import React from "react";
import renderer from "react-test-renderer";

import { ImmutableExistingEntry } from "../ImmutableExistingEntry";

describe("Tests ExistingEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(<ImmutableExistingEntry vernacular={""} gloss={""} />);
    });
  });
});
