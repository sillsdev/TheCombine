import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { baseDomain } from "types/SemanticDomain";
import { defaultState } from "components/App/DefaultState";
import { ExistingDataTable } from "components/DataEntry/ExistingDataTable/ExistingDataTable";

jest.mock("components/DataEntry/ExistingDataTable/ImmutableExistingData");

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

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
