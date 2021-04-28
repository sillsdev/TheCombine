import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { ExistingDataTable } from "components/DataEntry/ExistingDataTable/ExistingDataTable";
import { baseDomain } from "types/SemanticDomain";

jest.mock("components/DataEntry/ExistingDataTable/ImmutableExistingData");

// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore([])({});

describe("ExistingData", () => {
  it("renders on side without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <ExistingDataTable
            domain={baseDomain}
            typeDrawer={false}
            domainWords={[]}
            drawerOpen={false}
            toggleDrawer={jest.fn()}
          />
        </Provider>
      );
    });
  });
  it("renders drawer version without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <ExistingDataTable
            domain={baseDomain}
            typeDrawer={true}
            domainWords={[]}
            drawerOpen={true}
            toggleDrawer={jest.fn()}
          />
        </Provider>
      );
    });
  });
});
