import { act, render, screen } from "@testing-library/react";

import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";

const MOCK_ANIMATE = jest.fn();

describe("DomainTileButton", () => {
  it("calls function on click", async () => {
    await createTile();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    screen.getByRole("button").click();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(1);
  });
});

// Creates the tile
async function createTile(direction = Direction.Next): Promise<void> {
  await act(async () => {
    render(
      <DomainTileButton
        direction={direction}
        domain={domMap[mapIds.parent]}
        onClick={MOCK_ANIMATE}
      />
    );
  });
}
