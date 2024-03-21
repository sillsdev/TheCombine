import { Button } from "@mui/material";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";

let tileMaster: ReactTestRenderer;
const MOCK_ANIMATE = jest.fn();

describe("DomainTileButton", () => {
  it("renders tile and matches the latest snapshot", async () => {
    await createTile();
    snapTest();
  });

  it("calls function on click", async () => {
    await createTile();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    tileMaster.root.findByType(Button).props.onClick();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(1);
  });
});

// Creates the tile
async function createTile(direction = Direction.Next): Promise<void> {
  await act(async () => {
    tileMaster = create(
      <DomainTileButton
        direction={direction}
        domain={domMap[mapIds.parent]}
        onClick={MOCK_ANIMATE}
      />
    );
  });
}

// Perform a snapshot test
function snapTest(): void {
  expect(tileMaster.toJSON()).toMatchSnapshot();
}
