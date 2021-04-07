import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";
import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";

const createMockStore = configureMockStore([]);
const mockWord = mockWords()[0];

describe("DeleteCell", () => {
  const mockStore = createMockStore(defaultState);
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
