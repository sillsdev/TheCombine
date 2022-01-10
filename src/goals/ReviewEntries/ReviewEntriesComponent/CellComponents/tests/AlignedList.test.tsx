import ReactDOM from "react-dom";

import AlignedList from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/AlignedList";

describe("AlignedList", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <AlignedList
        contents={[<div key={0} />, <div key={1} />]}
        listId={"testId"}
        bottomCell={<div />}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
