import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import TreeViewComponent from "../TreeViewComponent";
import { defaultState } from "../TreeViewReducer";
import SemanticDomain from "../SemanticDomain";

var treeMaster: ReactTestRenderer;
var treeHandle: TreeViewComponent;

const RETURN_MOCK = jest.fn();
const NAVIGATE_MOCK = jest.fn();

// Mock out setTimeout
jest.useFakeTimers();

// Mock out Zoom to avoid issues with portals
jest.mock("@material-ui/core", () => {
  const realMaterialUi = jest.requireActual("@material-ui/core");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container
  };
});

beforeEach(() => {
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeViewComponent
        currentDomain={defaultState.currentDomain}
        returnControlToCaller={RETURN_MOCK}
        navigate={NAVIGATE_MOCK}
      />
    );
  });
  treeHandle = treeMaster.root.findByType(TreeViewComponent).instance;

  RETURN_MOCK.mockClear();
  NAVIGATE_MOCK.mockClear();
});

describe("Tests AddWords", () => {
  it("Renders correctly", () => {
    // Default snapshot test
    snapTest("default view");
  });

  it("Sets a new domain upon navigation", () => {
    let newDom: SemanticDomain = {
      name: "test",
      number: "test",
      subDomains: []
    };

    treeHandle.animate(newDom);
    jest.runAllTimers();

    expect(NAVIGATE_MOCK).toHaveBeenCalledWith(newDom);
  });

  it("Returns control to caller when the same semantic domain is passed in", () => {
    treeHandle.animate(defaultState.currentDomain);
    jest.runAllTimers();

    expect(NAVIGATE_MOCK).toHaveBeenCalledTimes(0);
    expect(RETURN_MOCK).toHaveBeenCalledTimes(1);
  });
});

// Perform a snapshot test
function snapTest(name: string) {
  expect(treeMaster.toJSON()).toMatchSnapshot();
}
