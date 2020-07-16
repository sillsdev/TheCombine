import { mockDomainTree } from "./MockDomainTree";
import { mockWord, mockDomainWord } from "./MockWord";
import { defaultProject as mockProject } from "../../../types/project";
import { Word, State, DomainWord } from "../../../types/word";
import {
  filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "../DataEntryComponent";
import DomainTree from "../../TreeView/SemanticDomain";
import _ from "lodash";

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
  it("should return empty Word Array when given empty Word Array", () => {
    let words: Word[] = [];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
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

  it("should not filter words that are accessible", () => {
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
    var mockDomains: DomainTree[] = [
      { ...mockDomainTree },
      { ...mockDomainTree },
    ];

    mockDomains[0].name = "daily";
    mockDomains[0].id = "ID_one";
    mockDomains[1].name = "weather";
    mockDomains[1].id = "ID_two";

    var unfilteredWords: Word[] = [
      _.cloneDeep(mockWord),
      _.cloneDeep(mockWord),
      _.cloneDeep(mockWord),
      _.cloneDeep(mockWord),
    ];

    unfilteredWords[0].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[0].vernacular = "one";
    unfilteredWords[1].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[1].vernacular = "two";
    unfilteredWords[2].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[2].vernacular = "three";
    unfilteredWords[3].senses[0].semanticDomains[0] = mockDomains[0];
    unfilteredWords[3].vernacular = "four";

    let domainWords: DomainWord[] = [];
    let curDomainWord: DomainWord = {
      word: unfilteredWords[3],
      gloss: unfilteredWords[3].senses[0].glosses[0],
    };
    domainWords.push(curDomainWord);
    expect(filterWordsByDomain(unfilteredWords, mockDomains[0])).toStrictEqual(
      domainWords
    );
  });

  it("sorts words alphabetically", () => {
    let mockDomain = mockDomainTree;
    mockDomain.name = "daily";
    let unfilteredWords: Word[] = [
      { ...mockWord },
      { ...mockWord },
      { ...mockWord },
    ];
    let filteredDomainWords: DomainWord[] = [
      { ...mockDomainWord },
      { ...mockDomainWord },
      { ...mockDomainWord },
    ];

    for (let currentWord of unfilteredWords) {
      currentWord.senses[0].semanticDomains[0] = mockDomain;
    }
    unfilteredWords[0].vernacular = "Always";
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
