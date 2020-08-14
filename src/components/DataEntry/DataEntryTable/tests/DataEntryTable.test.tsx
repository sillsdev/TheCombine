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
import { SemanticDomain, simpleWord, Word } from "../../../../types/word";
import { defaultState } from "../../../App/DefaultState";
import DataEntryTable from "../DataEntryTable";
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
});
