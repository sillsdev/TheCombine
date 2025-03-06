import { act, render } from "@testing-library/react";

import DeleteEntry from "components/DataEntry/DataEntryTable/EntryCellComponents/DeleteEntry";

describe("DeleteEntry", () => {
  it("renders without crashing", async () => {
    await act(async () => {
      render(<DeleteEntry removeEntry={jest.fn()} buttonId="" />);
    });
  });
});
