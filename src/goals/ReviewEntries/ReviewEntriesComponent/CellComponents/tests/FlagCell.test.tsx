import renderer from "react-test-renderer";

import FlagCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/FlagCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const mockWord = mockWords()[1];

describe("FlagCell", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(<FlagCell rowData={mockWord} value={mockWord.flag} />);
    });
  });

  it("renders editable without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <FlagCell rowData={mockWord} value={mockWord.flag} editable />
      );
    });
  });
});
