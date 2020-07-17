import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../../App/DefaultState";
import { baseDomain } from "../../../../types/SemanticDomain";
import { ExistingDataTable } from "../ExistingDataTable";

jest.mock("../ImmutableExistingData/ImmutableExistingData");

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

const domains = [{ ...baseDomain }, { ...baseDomain }, { ...baseDomain }];

domains[0].name = "daily";
domains[1].name = "weather";

describe("Tests ExistingData", () => {
  it("rendered on side without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(
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
      testRenderer = renderer.create(
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
