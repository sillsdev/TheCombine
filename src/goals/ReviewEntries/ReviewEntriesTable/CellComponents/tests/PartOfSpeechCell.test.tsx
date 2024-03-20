import renderer from "react-test-renderer";

import PartOfSpeechCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/PartOfSpeechCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

const mockWord = mockWords()[1];

describe("PartOfSpeechCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(<PartOfSpeechCell rowData={mockWord} />);
    });
  });
});
