import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

jest.mock("components/TreeView/TreeViewComponent", () => "div");

const mockStore = configureMockStore()();
const mockWord = mockWords()[0];

describe("DomainCell", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DomainCell rowData={mockWord} />
        </Provider>
      );
    });
  });

  it("renders sort-stylized without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <DomainCell rowData={mockWord} sortingByThis />
        </Provider>
      );
    });
  });
});
