import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";

const createMockStore = configureMockStore([]);
const mockWord = mockWords()[0];

describe("DomainCell", () => {
  const mockStore = createMockStore(defaultState);
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <DomainCell rowData={mockWord} sortingByDomains={true} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
