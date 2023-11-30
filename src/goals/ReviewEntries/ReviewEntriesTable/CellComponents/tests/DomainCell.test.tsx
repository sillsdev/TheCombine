import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState as treeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import DomainCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/DomainCell";
import { ColumnId } from "goals/ReviewEntries/ReviewEntriesTypes";
import mockWords from "goals/ReviewEntries/tests/WordsMock";

jest.mock("components/TreeView", () => "div");

const mockStore = (sortByThis?: boolean): Store =>
  configureMockStore()({
    reviewEntriesState: { sortBy: sortByThis ? ColumnId.Domains : undefined },
    treeViewState,
  });
const mockWord = mockWords()[0];

describe("DomainCell", () => {
  it("renders editable", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore()}>
          <DomainCell rowData={mockWord} editDomains={jest.fn()} />
        </Provider>
      );
    });
  });

  it("renders sort-stylized", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore(true)}>
          <DomainCell rowData={mockWord} />
        </Provider>
      );
    });
  });
});
