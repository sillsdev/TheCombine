import { AddComment, Comment } from "@mui/icons-material";
import {
  type ReactTestInstance,
  type ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";

import NoteButton from "components/Buttons/NoteButton";

const mockText = "Test text";

let testMaster: ReactTestRenderer;
let testHandle: ReactTestInstance;

async function renderWithText(text: string): Promise<void> {
  await act(async () => {
    testMaster = create(
      <NoteButton noteText={text} updateNote={jest.fn()} buttonId="" />
    );
  });
  testHandle = testMaster.root;
}

describe("NoteButton", () => {
  it("renders without text", async () => {
    await renderWithText("");
    expect(testHandle.findAllByType(AddComment).length).toBe(1);
    expect(testHandle.findAllByType(Comment).length).toBe(0);
  });

  it("renders with text", async () => {
    await renderWithText(mockText);
    expect(testHandle.findAllByType(AddComment).length).toBe(0);
    expect(testHandle.findAllByType(Comment).length).toBe(1);
  });
});
