import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";
import { defaultState as reviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";

const mockStore = configureMockStore()({ reviewEntriesState });
const mockWord = mockWords()[0];

describe("DeleteCell", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DeleteCell rowData={mockWord} />
        </Provider>
      );
    });
  });
});
