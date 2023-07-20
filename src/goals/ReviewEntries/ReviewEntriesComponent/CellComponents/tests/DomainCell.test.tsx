import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";

jest.mock("components/TreeView", () => "div");

const mockStore = configureMockStore()();
const mockWord = mockWords()[0];

describe("DomainCell", () => {
  it("renders editable", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DomainCell rowData={mockWord} editDomains={jest.fn()} />
        </Provider>
      );
    });
  });

  it("renders sort-stylized", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DomainCell rowData={mockWord} sortingByThis />
        </Provider>
      );
    });
  });
});
