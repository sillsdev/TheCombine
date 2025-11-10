import { act, render, screen, waitFor } from "@testing-library/react";

import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import domMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";

// Mock the backend API
jest.mock("backend");
const mockGetDomainProgressProportion = backend.getDomainProgressProportion as jest.Mock;

const MOCK_ANIMATE = jest.fn();

beforeAll(() => {
  LocalStorage.setProjectId("test-project-id");
  mockGetDomainProgressProportion.mockResolvedValue(0.5);
});

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
    // Wait for promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
