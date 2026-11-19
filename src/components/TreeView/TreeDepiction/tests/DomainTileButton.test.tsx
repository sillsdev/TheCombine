import { act, render, screen } from "@testing-library/react";

import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";

jest.mock("backend", () => ({
  getDomainProgressProportion: () => mockGetDomainProgressProportion(),
  getDomainWordCount: () => Promise.resolve(0),
}));

const MOCK_ANIMATE = jest.fn();
const mockGetDomainProgressProportion = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDomainProgressProportion.mockResolvedValue(0.5);
});

describe("DomainTileButton", () => {
  it("calls function on click", async () => {
    await createTile();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    screen.getByRole("button").click();
    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(1);
  });

  it.each([Direction.Down, Direction.Prev, Direction.Next])(
    "shows progress for direction %s",
    async (direction) => {
      await createTile(direction);
      expect(screen.queryByTestId("domain-progress-fill")).toBeTruthy();
      expect(mockGetDomainProgressProportion).toHaveBeenCalledTimes(1);
    }
  );

  it("doesn't show progress on the parent tile", async () => {
    await createTile(Direction.Up);
    expect(screen.queryByTestId("domain-progress-fill")).toBeNull();
    expect(mockGetDomainProgressProportion).not.toHaveBeenCalled();
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
