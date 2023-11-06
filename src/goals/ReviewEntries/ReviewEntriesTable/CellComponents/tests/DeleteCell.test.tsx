import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState as reviewEntriesState } from "goals/ReviewEntries/Redux/ReviewEntriesReduxTypes";
import DeleteCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/DeleteCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

const mockStore = configureMockStore()({ reviewEntriesState });
const mockWord = mockWords()[0];

describe("DeleteCell", () => {
  it("renders", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DeleteCell rowData={mockWord} />
        </Provider>
      );
    });
  });
});
