import React from "react";
import renderer from "react-test-renderer";

import LocalizedDeleteEntry from "../DeleteEntry";

describe("Tests DeleteEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(<LocalizedDeleteEntry removeEntry={() => null} />);
    });
  });
});
