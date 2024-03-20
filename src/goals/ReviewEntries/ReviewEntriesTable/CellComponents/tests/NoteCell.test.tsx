import renderer from "react-test-renderer";

import NoteCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/NoteCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

// The multiline TextField causes problems in the mock environment.
jest.mock("@mui/material/TextField", () => "div");

const mockWord = mockWords()[0];

describe("NoteCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(
        <NoteCell rowData={mockWord} value={mockWord.noteText} />
      );
    });
  });
});
