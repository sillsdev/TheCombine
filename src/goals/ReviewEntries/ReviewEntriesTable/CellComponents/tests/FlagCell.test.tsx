import renderer from "react-test-renderer";

import FlagCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/FlagCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

const mockWord = mockWords()[1];

describe("FlagCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(<FlagCell rowData={mockWord} value={mockWord.flag} />);
    });
  });

  it("renders editable", () => {
    renderer.act(() => {
      renderer.create(
        <FlagCell rowData={mockWord} value={mockWord.flag} editable />
      );
    });
  });
});
