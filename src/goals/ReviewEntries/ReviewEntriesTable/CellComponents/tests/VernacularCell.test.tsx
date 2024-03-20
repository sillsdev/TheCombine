import renderer from "react-test-renderer";

import VernacularCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/VernacularCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

// The multiline TextField causes problems in the mock environment.
jest.mock("@mui/material/TextField", () => "div");

const mockWord = mockWords()[0];

describe("VernacularCell", () => {
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
