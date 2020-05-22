import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import SemanticDomainWithSubdomains from "../SemanticDomain";
import TreeViewHeader from "../TreeViewHeader";
import MockTree from "./MockSemanticTree";

// Variable event
var event = {
  bubbles: false,
  key: "Enter",
  preventDefault: jest.fn(),
  target: {
    value: "",
  },
};

// Handles
var treeMaster: ReactTestRenderer;
var treeHandle: TreeViewHeader;
const MOCK_ANIMATE = jest.fn();

// Mock out window
const ADD_LISTENER = window.addEventListener.prototype;
const REMOVE_LISTENER = window.removeEventListener.prototype;
window = {
  ...window,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

beforeEach(() => {
  setTree(MockTree.subdomains[1]);
  MOCK_ANIMATE.mockClear();
});

afterAll(() => {
  window = {
    ...window,
    addEventListener: ADD_LISTENER,
    removeEventListener: REMOVE_LISTENER,
  };
});

describe("Tests TreeViewHeader", () => {
  it("Renders correctly", () => {
    // Default snapshot test
    snapTest("default view");
  });

  // onKeyDown
  it("Search & select domain switches semantic domain if given number found", () => {
    treeHandle.setState({ input: MockTree.id });
    event.target.value = "not empty";
    treeHandle.searchAndSelectDomain((event as any) as React.KeyboardEvent);

    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockTree);
    expect(treeHandle.state.input).toEqual("");
    expect(event.target.value).toEqual("");
  });

  it("Search & select domain does not switch semantic domain if given number not found", () => {
    const TEST: string = "10";
    treeHandle.setState({ input: TEST });
    event.target.value = TEST;
    treeHandle.searchAndSelectDomain((event as any) as React.KeyboardEvent);

    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    expect(treeHandle.state.input).toEqual(TEST);
    expect(event.target.value).toEqual(TEST);
  });

  it("Search & select domain switches semantic domain if given name found", () => {
    treeHandle.setState({ input: MockTree.subdomains[2].name });
    event.target.value = "not empty";
    treeHandle.searchAndSelectDomain((event as any) as React.KeyboardEvent);

    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockTree.subdomains[2]);
    expect(treeHandle.state.input).toEqual("");
    expect(event.target.value).toEqual("");
  });

  it("Search & select domain does not switch semantic domain if given name not found", () => {
    const TEST: string = "itsatrap";
    treeHandle.setState({ input: TEST });
    event.target.value = TEST;
    treeHandle.searchAndSelectDomain((event as any) as React.KeyboardEvent);

    expect(MOCK_ANIMATE).toHaveBeenCalledTimes(0);
    expect(treeHandle.state.input).toEqual(TEST);
    expect(event.target.value).toEqual(TEST);
  });

  // getBrotherDomain
  it("provides the proper brother domains", () => {
    // Standard navigation
    expect(treeHandle.getBrotherDomain(-1)).toEqual(MockTree.subdomains[0]);
    expect(treeHandle.getBrotherDomain(1)).toEqual(MockTree.subdomains[2]);

    // Check with indices out-of-bounds
    expect(treeHandle.getBrotherDomain(-2)).toEqual(undefined);
    expect(treeHandle.getBrotherDomain(2)).toEqual(undefined);

    // Check that a domain w/ no parentDomain has no brotherDomains
    setTree(MockTree);
    expect(treeHandle.getBrotherDomain(-1)).toEqual(undefined);
  });

  // navigateKeys
  it("navigateKeys w/ Arrow Down switches to parent domain", () => {
    event.key = "ArrowDown";
    treeHandle.navigateDomainArrowKeys((event as any) as KeyboardEvent);
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockTree);
  });

  it("navigateKeys w/ Arrow Left switches to left brother domain", () => {
    event.key = "ArrowLeft";
    treeHandle.navigateDomainArrowKeys((event as any) as KeyboardEvent);
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockTree.subdomains[0]);
  });

  it("navigateKeys w/ Arrow Right switches to right brother domain", () => {
    event.key = "ArrowRight";
    treeHandle.navigateDomainArrowKeys((event as any) as KeyboardEvent);
    expect(MOCK_ANIMATE).toHaveBeenCalledWith(MockTree.subdomains[2]);
  });
});

// Creates the tree
function setTree(domain: SemanticDomainWithSubdomains) {
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeViewHeader currentDomain={domain} animate={MOCK_ANIMATE} />
    );
  });
  treeHandle = treeMaster.root.findByType(TreeViewHeader).instance;
}

// Perform a snapshot test
function snapTest(name: string) {
  expect(treeMaster.toJSON()).toMatchSnapshot();
}
