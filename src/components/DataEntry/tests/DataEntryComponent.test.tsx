import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { mockDomainTree } from "./MockDomainTree";
import { mockWord } from "./MockWord";
import {ExistingDataTable } from "../ExistingDataTable/ExistingDataTable";
import { defaultProject as mockProject } from "../../../types/project";
import { SemanticDomain, Word, State } from "../../../types/word";
import { DataEntryComponent, filterWords, filterWordsByDomain } from "../DataEntryComponent";

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

const unfilteredWords = [mockWord, mockWord, mockWord, mockWord];
const domains = [mockDomainTree, mockDomainTree, mockDomainTree];

domains[0].name = "daily";
domains[1].name = "weather";

jest.mock("../../../../backend", () => {
  return {
    createWord: jest.fn((_word: Word) => {
      return Promise.resolve(mockWord);
    }),
    getFrontierWords: jest.fn(() => {
      return Promise.resolve([mockWord]);
    }),
    getProject: jest.fn((_id: string) => {
      return Promise.resolve(mockProject);
    }),
  };
});

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

describe("Tests DataEntryComponent", () => {
  it("gets words from the backend", () => {

  });

  it("should filter out words that are not accessible", () => {
    let words: Word[] = [];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
    let word = { ...mockWord };
    word.senses[0].accessibility = State.active;
    let words: Word[] = [
      {
        ...mockWord,
        senses: [
          {
            glosses: [],
            semanticDomains: [],
          },
        ],
      },
    ];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
    let word = { ...mockWord };
    word.senses[0].accessibility = State.active;
    let words: Word[] = [
      {
        ...mockWord,
        senses: [
          {
            glosses: [],
            semanticDomains: [],
            accessibility: State.active,
          },
        ],
      },
    ];
    let expectedWords: Word[] = [...words];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("filters words by domain correctly", () => {
    unfilteredWords[0].senses[0].semanticDomains[0] = domains[0];
    unfilteredWords[1].senses[0].semanticDomains[0] = domains[1];

    let expectedLength = 1;
    expect(filterWordsByDomain(unfilteredWords, domains[0]).length).toBe(
      expectedLength
    );
  });
  it("handles window size change", () => {

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

    let instance = ExistingDataTableHandle.instance
    instance.setState(
      { existingWords: unfilteredWords }, () => {
        
      }
    ); //TODO

  });
});
