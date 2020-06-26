import React from "react";
import ReactDOM from "react-dom";
import { ExistingDataTable, filterWordsByDomain } from "../ExistingDataTable";
import { mockDomainTree } from "../../tests/MockDomainTree";
import { mockWord } from "../../tests/MockWord";
import { Word } from "../../../../types/word";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../../App/DefaultState";
import { Provider } from "react-redux";
import DataEntryTable from "../../DataEntryTable/DataEntryTable";
import { mockSemanticDomain } from "../../DataEntryTable/tests/DataEntryTable.test";
jest.mock("../ImmutableExistingData/ImmutableExistingData");

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

beforeEach(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ExistingDataTable domain={mockDomainTree} typeDrawer={false} />
      </Provider>
    );
  });
});

const unfilteredWords = [mockWord, mockWord, mockWord, mockWord];
const domains = [mockDomainTree, mockDomainTree, mockDomainTree];

domains[0].name = "daily";
domains[1].name = "weather";

describe("Tests ExistingData", () => {
  it("filters words by domain", () => {
    unfilteredWords[0].senses[0].semanticDomains[0] = domains[0];
    unfilteredWords[1].senses[0].semanticDomains[0] = domains[1];

    let expectedLength = 1;
    expect(filterWordsByDomain(unfilteredWords, domains[0]).length).toBe(
      expectedLength
    );
  });

  it("sorts words alphabetically", () => {
    for (let currentMockWord of unfilteredWords) {
      currentMockWord.senses[0].semanticDomains[0] = domains[0];
    }
    unfilteredWords[0].vernacular = "Allways";
    unfilteredWords[1].vernacular = "Be";
    unfilteredWords[2].vernacular = ""; //empty
    unfilteredWords[3].vernacular = "?character";

    let ExistingDataTableItems = testRenderer.root.findAllByType(
      ExistingDataTable
    );
    expect(ExistingDataTableItems.length).toBe(1);
    var ExistingDataTableHandle: ReactTestInstance = ExistingDataTableItems[0];

    ExistingDataTableHandle.instance.setState(
      { existingWords: unfilteredWords },
      () => {}
    ); //TODO
  });
});
