import React from "react";
import renderer from "react-test-renderer";

import ImmutableEntry from "../ImmutableEntry";

describe("Tests ExistingEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(<ImmutableEntry vernacular={""} gloss={""} />);
    });
  });
});
