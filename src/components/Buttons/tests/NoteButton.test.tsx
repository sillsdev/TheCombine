import { act, render, screen } from "@testing-library/react";

import NoteButton from "components/Buttons/NoteButton";

const mockText = "Test text";

async function renderWithText(text: string): Promise<void> {
  await act(async () => {
    render(<NoteButton noteText={text} updateNote={jest.fn()} buttonId="" />);
  });
}

// Built-in data-testid values for the MUI Icons
const testIdAddComment = "AddCommentIcon";
const testIdComment = "CommentIcon";

describe("NoteButton", () => {
  it("renders without text", async () => {
    await renderWithText("");
    expect(screen.queryByTestId(testIdAddComment)).not.toBeNull();
    expect(screen.queryByTestId(testIdComment)).toBeNull();
    expect(screen.queryByLabelText(mockText)).toBeNull();
  });

  it("renders with text", async () => {
    await renderWithText(mockText);
    expect(screen.queryByTestId(testIdAddComment)).toBeNull();
    expect(screen.queryByTestId(testIdComment)).not.toBeNull();
    expect(screen.queryByLabelText(mockText)).not.toBeNull();
  });
});
