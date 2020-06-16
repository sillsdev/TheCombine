import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import MockDomain from "./MockSemanticDomain";
import DomainTile, { Direction } from "../DomainTile";

var tileMaster: ReactTestRenderer;
const MOCK_ANIMATE = jest.fn();

beforeEach(() => {
  createTile(Direction.Right);
});

describe("Tests DomainTile", () => {
  it("Renders without crashing", () => {
    tileMaster.toJSON();
  });

  it("Matches the latest snapshot", () => {
    snapTest();
  });
});

// Creates the tile
function createTile(direction?: Direction) {
  renderer.act(() => {
    tileMaster = renderer.create(
      <DomainTile
        domain={MockDomain}
        onClick={MOCK_ANIMATE}
        direction={direction}
      />
    );
  });
}

// Perform a snapshot test
function snapTest() {
  expect(tileMaster.toJSON()).toMatchSnapshot();
}
