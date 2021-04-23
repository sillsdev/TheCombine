import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";
import { defaultState as reviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesReducer";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const createMockStore = configureMockStore([]);
const mockWord = mockWords()[0];

describe("DeleteCell", () => {
  const mockStore = createMockStore({
    reviewEntriesState: { ...reviewEntriesState },
  });
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <DeleteCell rowData={mockWord} delete={jest.fn()} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
