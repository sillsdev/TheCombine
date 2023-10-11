import "@testing-library/jest-dom";
import { act, cleanup } from "@testing-library/react";

import MergeDupsStep from "goals/MergeDuplicates/MergeDupsStep";
import { setupStore } from "store";
import { renderWithProviders } from "utilities/testUtilities";

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(cleanup);

describe("Render MergeDups", () => {
  it("Renders MergeDups with no errors", async () => {
    const store= setupStore();
    await act(async () => {
      renderWithProviders(<MergeDupsStep />, {store: store});
    });
  });
});
