import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../../App/DefaultState";
import { filterWordsByDomain } from "../../DataEntryComponent";
import { mockDomainTree } from "../../tests/MockDomainTree";
import { mockWord } from "../../tests/MockWord";
import { ExistingDataTable } from "../ExistingDataTable";

jest.mock("../ImmutableExistingData/ImmutableExistingData");

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

beforeEach(() => {
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

const unfilteredWords = [mockWord, mockWord, mockWord, mockWord];
const domains = [mockDomainTree, mockDomainTree, mockDomainTree];

domains[0].name = "daily";
domains[1].name = "weather";

describe("Tests ExistingData", () => {
  it("rendered", () => {});
});
