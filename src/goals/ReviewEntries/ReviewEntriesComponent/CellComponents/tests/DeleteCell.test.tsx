import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";
import { defaultState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReduxTypes";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const createMockStore = configureMockStore();
const mockWord = mockWords()[0];

describe("DeleteCell", () => {
  const mockStore = createMockStore({
    reviewEntriesState: { ...defaultState },
  });
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <DeleteCell rowData={mockWord} delete={jest.fn()} value={""} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
