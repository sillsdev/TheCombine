import renderer from "react-test-renderer";

import "localization/mocks/reactI18nextMock";

import SenseCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/SenseCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

const mockWord = mockWords()[1];

describe("SenseCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(
        <SenseCell
          rowData={mockWord}
          value={mockWord.senses}
          delete={jest.fn()}
        />
      );
    });
  });
});
