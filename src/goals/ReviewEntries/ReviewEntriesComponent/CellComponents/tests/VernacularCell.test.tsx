import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { VernacularCell } from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";

// The multiline Input, TextField cause problems in the mock environment.
jest.mock("@mui/material/TextField", () => "div");

const mockWord = mockWords()[0];

describe("NoteCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(
        <VernacularCell rowData={mockWord} value={mockWord.vernacular} />
      );
    });
  });

  it("renders editable", () => {
    renderer.act(() => {
      renderer.create(
        <VernacularCell
          rowData={mockWord}
          value={mockWord.vernacular}
          editable
        />
      );
    });
  });
});
