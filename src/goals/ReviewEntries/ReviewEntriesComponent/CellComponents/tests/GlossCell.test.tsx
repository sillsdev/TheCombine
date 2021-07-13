import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import GlossCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/GlossCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const state = {
  currentProject: { analysisWritingSystems: [{ bcp47: "en" }] },
};
const mockStore = configureMockStore([])(state);
const mockWord = mockWords()[0];

describe("GlossCell", () => {
  it("Renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <GlossCell
            rowData={mockWord}
            value={mockWord.senses}
            editable
            sortingByThis
          />
        </Provider>
      );
    });
  });
});
