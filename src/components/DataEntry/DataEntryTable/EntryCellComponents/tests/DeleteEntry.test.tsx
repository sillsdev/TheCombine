import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import DeleteEntry from "components/DataEntry/DataEntryTable/EntryCellComponents/DeleteEntry";

describe("DeleteEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(<DeleteEntry removeEntry={jest.fn()} buttonId="" />);
    });
  });
});
