import { Button } from "@material-ui/core";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import DomainTile, { Direction } from "components/TreeView/DomainTile";
import domMap, { mapIds } from "components/TreeView/tests/MockSemanticDomain";

var tileMaster: ReactTestRenderer;
const MOCK_ANIMATE = jest.fn();

describe("DomainTile", () => {
  it("Renders directionless (default) tile without crashing", () => {
    createTile();
  });

  it("Renders directional tile without crashing", () => {
    createTile(Direction.Right);
  });

  it("Tile with direction matches the latest snapshot", () => {
    createTile(Direction.Right);
    snapTest();
  });

  it("Click calls function", () => {
    createTile();
    tileMaster.root.findByType(Button).props.onClick();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(1);
  });
});

// Creates the tile
function createTile(direction?: Direction) {
  renderer.act(() => {
    tileMaster = renderer.create(
      <DomainTile
        domain={domMap[mapIds.parent]}
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
