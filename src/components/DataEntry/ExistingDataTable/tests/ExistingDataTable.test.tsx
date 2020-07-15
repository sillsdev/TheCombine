import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../../App/DefaultState";
import { mockDomainTree } from "../../tests/MockDomainTree";
import { ExistingDataTable } from "../ExistingDataTable";

jest.mock("../ImmutableExistingData/ImmutableExistingData");

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

const domains = [
  { ...mockDomainTree },
  { ...mockDomainTree },
  { ...mockDomainTree },
];

domains[0].name = "daily";
domains[1].name = "weather";

describe("Tests ExistingData", () => {
  it("rendered on side without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <ExistingDataTable
            domain={mockDomainTree}
            typeDrawer={false}
            domainWords={[]}
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
            domain={mockDomainTree}
            typeDrawer={true}
            domainWords={[]}
          />
        </Provider>
      );
    });
  });
});
