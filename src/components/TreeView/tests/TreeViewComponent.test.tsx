import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import TreeViewComponent from "../TreeViewComponent";
import { defaultState } from "../TreeViewReducer";
import SemanticDomain from "../SemanticDomain";
import axios from "axios";
import mockTree from "./MockSemanticTree";

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

// Mock axios instance to mock return data
const mockAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: [defaultState.currentdomain] }));
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeViewComponent
        currentDomain={mockTree}
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
  it("Constructs correctly", () => {
    // Default snapshot test
    snapTest("default view");
    expect(NAVIGATE_MOCK).toHaveBeenCalledWith({
      name: "Semantic Domains",
      id: "", subdomains: [defaultState.currentdomain]});
  });

  it("Sets a new domain upon navigation", () => {
    let newDom: SemanticDomain = {
      name: "test",
      id: "test",
      subdomains: []
    };

    treeHandle.animate(newDom);
    jest.runAllTimers();

    expect(NAVIGATE_MOCK).toHaveBeenCalledWith(newDom);
  });

  it("Returns control to caller when the same semantic domain is passed in", () => {
    treeHandle.animate(mockTree);
    jest.runAllTimers();

    expect(RETURN_MOCK).toHaveBeenCalledTimes(1);
  });
});

// Perform a snapshot test
function snapTest(name: string) {
  expect(treeMaster.toJSON()).toMatchSnapshot();
}
