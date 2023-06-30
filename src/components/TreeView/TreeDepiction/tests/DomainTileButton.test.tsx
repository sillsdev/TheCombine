import { Button } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";

let tileMaster: renderer.ReactTestRenderer;
const MOCK_ANIMATE = jest.fn();

describe("DomainTileButton", () => {
  it("renders tile and matches the latest snapshot", () => {
    createTile();
    snapTest();
  });

  it("calls function on click", () => {
    createTile();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    tileMaster.root.findByType(Button).props.onClick();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(1);
  });
});

// Creates the tile
function createTile(direction = Direction.Next) {
  renderer.act(() => {
    tileMaster = renderer.create(
      <DomainTileButton
        direction={direction}
        domain={domMap[mapIds.parent]}
        onClick={MOCK_ANIMATE}
      />
    );
  });
}

// Perform a snapshot test
function snapTest() {
  expect(tileMaster.toJSON()).toMatchSnapshot();
}
