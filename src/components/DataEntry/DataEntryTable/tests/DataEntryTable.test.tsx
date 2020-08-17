import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import * as backend from "../../../../backend";
import { defaultProject as mockProject } from "../../../../types/project";
import { baseDomain } from "../../../../types/SemanticDomain";
import {
  SemanticDomain,
  simpleWord,
  Word,
  Sense,
  State,
} from "../../../../types/word";
import { defaultState } from "../../../App/DefaultState";
import DataEntryTable, {
  addSemanticDomainToSense,
  addSenseToWord,
} from "../DataEntryTable";
import NewEntry from "../NewEntry/NewEntry";

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
jest.mock("../../../Pronunciations/Recorder");

let testRenderer: ReactTestRenderer;
let testHandle: ReactTestInstance;

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const mockWord: Word = simpleWord("", "");
const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: "",
};
const hideQuestionsMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryTable
          domain={baseDomain}
          semanticDomain={mockSemanticDomain}
          displaySemanticDomainView={(_isGettingSemanticDomain: boolean) => {}}
          isSmallScreen={false}
          hideQuestions={hideQuestionsMock}
          getWordsFromBackend={() => {
            return new Promise(() => []);
          }}
          showExistingData={() => {}}
        />
      </Provider>
    );
  });
});

describe("Tests DataEntryTable", () => {
  it("should call add word on backend when new entry has data and complete is clicked", (done) => {
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
    let newEntryWord: Word = simpleWord("hasVern", "");
    testHandle = newEntryItems[0];
    testHandle.instance.setState(
      {
        newEntry: newEntryWord,
      },
      () => {
        // Get button for complete and push it
        testRenderer.root.findByProps({ id: "complete" }).props.onClick();
        // Assert that the backend function for adding the word was called
        expect(backend.createWord).toBeCalled();
        done();
      }
    );
  });

  it("should NOT call add word on backend when new entry has no data and complete is clicked", (done) => {
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
    // set the new entry to have no useful content
    let newEntryWord: Word = simpleWord("", "");
    testHandle = newEntryItems[0];
    testHandle.instance.setState(
      {
        newEntry: newEntryWord,
      },
      () => {
        // Get button for complete and push it
        testRenderer.root.findByProps({ id: "complete" }).props.onClick();
        // Assert that the backend function for adding the word was NOT called
        expect(backend.createWord).not.toBeCalled();
        done();
      }
    );
  });

  it("calls hideQuestions when complete is clicked", () => {
    testRenderer.root.findByProps({ id: "complete" }).props.onClick();
    expect(hideQuestionsMock).toBeCalledTimes(1);
  });

  it("adds a sense to a word that has no senses already", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let word: Word = mockWord;
    let gloss = "yeet";
    let newSense: Sense = {
      glosses: [{ language: "en", def: gloss }],
      semanticDomains: [semanticDomain],
      accessibility: State.active,
    };
    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, newSense],
    };
    expect(addSenseToWord(semanticDomain, word, gloss, "en")).toEqual(
      expectedWord
    );
  });

  it("adds a sense to a word that already has a sense", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let existingSense: Sense = {
      glosses: [{ language: "", def: "" }],
      semanticDomains: [{ name: "domain", id: "10.2" }],
    };
    let word: Word = {
      ...mockWord,
      senses: [...mockWord.senses, existingSense],
    };
    let gloss = "yeet";
    let expectedSense: Sense = {
      glosses: [{ language: "en", def: gloss }],
      semanticDomains: [semanticDomain],
      accessibility: State.active,
    };
    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, expectedSense],
    };
    expect(addSenseToWord(semanticDomain, word, gloss, "en")).toEqual(
      expectedWord
    );
  });

  it("adds a semantic domain to an existing sense", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let sense: Sense = {
      glosses: [{ language: "en", def: "yeet" }],
      semanticDomains: [],
      accessibility: State.active,
    };
    let word: Word = {
      ...mockWord,
      senses: [...mockWord.senses, sense],
    };
    let senseIndex = word.senses.length - 1;
    let expectedWord: Word = {
      ...mockWord,
      senses: [
        ...mockWord.senses,
        {
          ...sense,
          semanticDomains: [semanticDomain],
        },
      ],
    };
    expect(addSemanticDomainToSense(semanticDomain, word, senseIndex)).toEqual(
      expectedWord
    );
  });
});
