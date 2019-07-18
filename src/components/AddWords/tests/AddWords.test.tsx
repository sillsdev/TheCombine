import React from "react";

import GoalSelectorScroll from "..";

import { Provider } from "react-redux";
import { act, Simulate } from "react-dom/test-utils";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer
} from "react-test-renderer";
import AddWords from "../";
import configureStore from "redux-mock-store";
import AddWords_unconnected from "../AddWordsComponent";
import { LocalizeProvider } from "react-localize-redux";
import configureMockStore from "redux-mock-store";
import createMockStore from "redux-mock-store";
import { GoalSelectorState } from "../../../types/goals";
import axios from "axios";
import { Word } from "../../../types/word";

jest.mock("@material-ui/core", () => {
  const material = jest.requireActual("@material-ui/core");
  return {
    ...material,
    Dialog: material.Box
  };
});

let master: renderer.ReactTestRenderer;
let handle: renderer.ReactTestInstance;

const testWord: Word = {
  id: "",
  vernacular: "",
  senses: [
    {
      glosses: [],
      semanticDomains: []
    }
  ],
  audio: "",
  created: "",
  modified: "",
  history: [],
  partOfSpeech: "",
  editedBy: [],
  accessability: 0,
  otherField: "",
  plural: ""
};

// Mock getTranslate
const MOCK_TRANSLATE = jest.fn(_ => {
  return "dummy";
});
jest.mock("react-localize-redux", () => {
  const localize = jest.requireActual("react-localize-redux");
  return {
    ...localize,
    getTranslate: jest.fn(_ => {
      return MOCK_TRANSLATE;
    })
  };
});
jest.mock("axios");
let mockedAxios = axios as jest.Mocked<typeof axios>;

// Circumvent unneeded store connections
jest.mock("../../TreeView", () => {
  const material = jest.requireActual("@material-ui/core");
  return material.Container;
});

// Mock store
const mockStore = configureMockStore()({
  treeViewState: { currentDomain: { name: "en", number: "1", subDomains: [] } }
});

beforeEach(() => {
  // Here, use the act block to be able to render our AddWords into the DOM
  // Re-created each time to prevent actions from previous runs from affecting future runs
  act(() => {
    // Getfrontierwords
    mockedAxios.get.mockImplementationOnce(url => {
      return Promise.resolve({ data: [] });
    });
    master = renderer.create(
      <AddWords_unconnected
        domain={{ name: "en", id: "1", subDomains: [] }}
        translate={jest.fn(() => "ok")}
      />
    );
  });
  handle = master.root.findByType(AddWords_unconnected);

  mockedAxios.put.mockClear();
});

afterAll(() => {
  jest.unmock("../../TreeView");
});

describe("Tests AddWords", () => {
  it("Constructs correctly", () => {
    // Switch from the selectDomain view to normal view
    handle.instance.setState({
      ...handle.instance.state,
      gettingSemanticDomain: false
    });
    snapTest("default view");
  });

  it("Adds a word", done => {
    handle.instance.setState({ newVern: "testVern", newGloss: "testGloss" });
    mockedAxios.post.mockImplementationOnce((url, word: Word) => {
      return Promise.resolve({ data: "123" });
    });
    handle.instance.submit(undefined, () => {
      expect(handle.instance.state.rows).toEqual([
        {
          vernacular: "testVern",
          glosses: "testGloss",
          id: "123",
          senseIndex: 0,
          dupId: ""
        }
      ]);
      done();
    });
  });

  it("Edits a word", done => {
    handle.instance.setState({
      rows: [
        {
          vernacular: "testVern1",
          glosses: "testGloss1",
          id: "123",
          senseIndex: 0,
          dupId: ""
        },
        {
          vernacular: "testVern2",
          glosses: "testGloss2",
          id: "456",
          senseIndex: 0,
          dupId: ""
        },
        {
          vernacular: "testVern3",
          glosses: "testGloss3",
          id: "789",
          senseIndex: 0,
          dupId: ""
        }
      ]
    });
    mockedAxios.get.mockResolvedValueOnce({ data: testWord });
    mockedAxios.put.mockResolvedValueOnce({ data: 1 });
    handle.instance.updateWord(1, () => {
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("Removes a word", done => {
    handle.instance.setState({
      rows: [
        {
          vernacular: "testVern1",
          glosses: "testGloss1",
          id: "123",
          senseIndex: 0,
          dupId: ""
        },
        {
          vernacular: "testVern2",
          glosses: "testGloss2",
          id: "456",
          senseIndex: 0,
          dupId: ""
        },
        {
          vernacular: "testVern3",
          glosses: "testGloss3",
          id: "789",
          senseIndex: 0,
          dupId: ""
        }
      ]
    });
    mockedAxios.delete.mockResolvedValue(1);
    handle.instance.removeWord(456, () => {
      handle.instance.removeRow(1);
      expect(handle.instance.state.rows).toEqual([
        {
          vernacular: "testVern1",
          glosses: "testGloss1",
          id: "123",
          senseIndex: 0,
          dupId: ""
        },
        {
          vernacular: "testVern3",
          glosses: "testGloss3",
          id: "789",
          senseIndex: 0,
          dupId: ""
        }
      ]);
      done();
    });
  });
});

// Utility functions -----------------------------

// Perform a snapshot test
function snapTest(name: string) {
  expect(master.toJSON()).toMatchSnapshot();
}
