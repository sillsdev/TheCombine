import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import MockDomain from "./MockSemanticDomain";
import DomainTile, { Direction } from "../DomainTile";
import SemanticDomainWithSubdomains from "../SemanticDomain";

var tileMaster: ReactTestRenderer;
const MOCK_ANIMATE = jest.fn();

beforeEach(() => {});

describe("Tests DomainTile", () => {
  /*it("Renders correctly", () => {
    // Default snapshot test
    snapTest("default view");
  });*/

  it("Renders without crashing", () => {
    createTile();
    tileMaster.toJSON();
  });
});

// Creates the tile
function createTile() {
  renderer.act(() => {
    tileMaster = renderer.create(
      <DomainTile domain={MockDomain} onClick={MOCK_ANIMATE} />
    );
  });
}

// Perform a snapshot test
function snapTest(name: string) {
  expect(tileMaster.toJSON()).toMatchSnapshot();
}
