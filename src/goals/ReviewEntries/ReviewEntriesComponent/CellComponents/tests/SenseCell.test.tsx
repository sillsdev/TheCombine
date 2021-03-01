import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import SenseCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const state = {
  currentProject: { analysisWritingSystems: [{ bcp47: "en" }] },
};
const mockStore = configureMockStore([])(state);

describe("SenseCell", () => {
  it("Renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <SenseCell
            rowData={mockWords[0]}
            value={mockWords[0].senses}
            editable={true}
            sortingByGloss={true}
          />
        </Provider>
      );
    });
  });
});
