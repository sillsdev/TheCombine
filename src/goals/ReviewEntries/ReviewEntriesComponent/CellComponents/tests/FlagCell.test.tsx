import renderer from "react-test-renderer";

import FlagCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/FlagCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

// The multiline TextField causes problems in the mock environment.
jest.mock("@material-ui/core/TextField", () => "div");

const mockWord = mockWords()[1];

describe("FlagCell", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(<FlagCell rowData={mockWord} value={mockWord.senses} />);
    });
  });

  it("renders editable without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <FlagCell rowData={mockWord} value={mockWord.senses} editable />
      );
    });
  });
});
