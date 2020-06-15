import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import TreeViewComponent, { TreeView } from "../TreeViewComponent";
import SemanticDomainWithSubdomains from "../SemanticDomain";
import MockDomain from "./MockSemanticDomain";
import { store } from "../../../store";
import { Provider } from "react-redux";

var treeMaster: ReactTestRenderer;
var treeHandle: TreeView;

const RETURN_MOCK = jest.fn();
const NAVIGATE_MOCK = jest.fn();

// Mock out setTimeout
jest.useFakeTimers();

// Mock out Zoom to avoid issues with portals
jest.mock("@material-ui/core", () => {
  const realMaterialUi = jest.requireActual("@material-ui/core");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});

// Mock createDomains
jest.mock("../TreeViewReducer", () => {
  const realReducer = jest.requireActual("../TreeViewReducer");
  return {
    ...realReducer,
    createDomains: () => {
      return { currentDomain: MockDomain };
    },
  };
});

beforeAll(() => {
  createTree();
});

beforeEach(() => {
  RETURN_MOCK.mockClear();
  NAVIGATE_MOCK.mockClear();
});

describe("Tests AddWords", () => {
  it("Constructs correctly", () => {
    // Default snapshot test
    createTree();
    snapTest("default view");
  });

  // This assumes MockDomain was used in createTree() below and MockDomain.name !== ""
  it("Navigates to .currentDomain in construction", () => {
    createTree();
    expect(NAVIGATE_MOCK).toHaveBeenCalledTimes(1);
    expect(NAVIGATE_MOCK).toHaveBeenCalledWith(MockDomain);
  });

  it("Sets a new domain upon navigation", () => {
    let newDom: SemanticDomainWithSubdomains = {
      name: "test",
      id: "test",
      description: "super testy",
      subdomains: [],
      questions: [],
    };

    treeHandle.animate(newDom);
    jest.runAllTimers();

    expect(NAVIGATE_MOCK).toHaveBeenCalledWith(newDom);
  });

  it("Returns control to caller when the same semantic domain is passed in", () => {
    treeHandle.animate(MockDomain);
    jest.runAllTimers();

    expect(RETURN_MOCK).toHaveBeenCalledTimes(1);
  });
});

function createTree() {
  renderer.act(() => {
    treeMaster = renderer.create(
      <Provider store={store}>
        <TreeViewComponent
          currentDomain={MockDomain}
          returnControlToCaller={RETURN_MOCK}
          navigateTree={NAVIGATE_MOCK}
        />
      </Provider>
    );
  });
  treeHandle = treeMaster.root.findByType(TreeView).instance;
}

// Perform a snapshot test
function snapTest(name: string) {
  expect(treeMaster.toJSON()).toMatchSnapshot();
}
