import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import PartOfSpeechCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/PartOfSpeechCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";

const mockWord = mockWords()[1];

describe("PartOfSpeechCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(<PartOfSpeechCell rowData={mockWord} />);
    });
  });
});
