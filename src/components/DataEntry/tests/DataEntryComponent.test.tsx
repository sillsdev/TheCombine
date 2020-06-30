import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import * as backend from "../../../backend";
import { mockDomainTree } from "./MockDomainTree";
import { mockWord } from "./MockWord";
import { mockDomainWord } from "./MockDomainWord";
import { ExistingDataTable } from "../ExistingDataTable/ExistingDataTable";
import { defaultProject as mockProject } from "../../../types/project";
import { SemanticDomain, Word, State, DomainWord } from "../../../types/word";
import {
  DataEntryComponent,
  filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "../DataEntryComponent";
import { Done, Language } from "@material-ui/icons";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

const mockLanguage = Language;
mockLanguage.active = false;
mockLanguage.code = "";
mockLanguage.name = "mock";

jest.mock("../../../backend", () => {
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

describe("Tests DataEntryComponent", () => {
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

  it("filters out words that do not match desired domain", () => {
    jest.clearAllMocks();
    let mockDomains = [mockDomainTree, mockDomainTree];
    mockDomains[0].name = "daily";
    mockDomains[0].id = "123";
    mockDomains[1].name = "weather";
    mockDomains[1].id = "321";

    let unfilteredWords: Word[] = [mockWord, mockWord, mockWord, mockWord];
    unfilteredWords[0].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[0].vernacular = "one";
    unfilteredWords[1].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[1].vernacular = "two";
    unfilteredWords[2].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[2].vernacular = "three";
    unfilteredWords[3].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[3].vernacular = "four";

    let expectedValue: Word[] = [];
    expect(filterWordsByDomain(unfilteredWords, mockDomains[0])).toBe(
      expectedValue
    );
  });

  it("sorts words alphabetically", () => {
    let mockDomain = mockDomainTree;
    mockDomain.name = "daily";
    let unfilteredWords: Word[] = [mockWord, mockWord, mockWord];
    let filteredDomainWords: DomainWord[] = [
      mockDomainWord,
      mockDomainWord,
      mockDomainWord,
    ];

    for (let currentWord of unfilteredWords) {
      currentWord.senses[0].semanticDomains[0] = mockDomain;
    }
    unfilteredWords[0].vernacular = "Allways";
    unfilteredWords[1].vernacular = "Be";
    unfilteredWords[2].vernacular = "?character";

    filteredDomainWords[0].word = unfilteredWords[0];
    filteredDomainWords[1].word = unfilteredWords[1];
    filteredDomainWords[2].word = unfilteredWords[2];

    let expectedList = [
      filteredDomainWords[2],
      filteredDomainWords[0],
      filteredDomainWords[1],
    ];
    expect(sortDomainWordByVern(unfilteredWords, mockDomain)).toStrictEqual(
      expectedList
    );
  });
});
