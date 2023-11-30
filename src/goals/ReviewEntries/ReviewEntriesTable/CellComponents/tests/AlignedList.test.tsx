import renderer from "react-test-renderer";

import AlignedList from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/AlignedList";

describe("AlignedList", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <AlignedList
          contents={[<div key={0} />, <div key={1} />]}
          listId={"testId"}
          bottomCell={<div />}
        />
      );
    });
  });
});
