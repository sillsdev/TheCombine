import { AddComment, Comment } from "@mui/icons-material";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";

import EntryNote from "components/DataEntry/DataEntryTable/EntryCellComponents/EntryNote";

const mockText = "Test text";

let testMaster: ReactTestRenderer;
let testHandle: ReactTestInstance;

async function renderWithText(text: string): Promise<void> {
  await act(async () => {
    testMaster = create(
      <EntryNote noteText={text} updateNote={jest.fn()} buttonId="" />
    );
  });
  testHandle = testMaster.root;
}

describe("DeleteEntry", () => {
  it("renders without note", async () => {
    await renderWithText("");
    expect(testHandle.findAllByType(AddComment).length).toBe(1);
    expect(testHandle.findAllByType(Comment).length).toBe(0);
  });

  it("renders with note", async () => {
    await renderWithText(mockText);
    expect(testHandle.findAllByType(AddComment).length).toBe(0);
    expect(testHandle.findAllByType(Comment).length).toBe(1);
  });
});
