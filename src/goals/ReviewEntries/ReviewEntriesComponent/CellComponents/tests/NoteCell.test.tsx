import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { NoteCell } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";

// The multiline TextField causes problems in the mock environment.
jest.mock("@mui/material/TextField", () => "div");

const mockWord = mockWords()[0];

describe("NoteCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(
        <NoteCell rowData={mockWord} value={mockWord.noteText} />,
      );
    });
  });
});
