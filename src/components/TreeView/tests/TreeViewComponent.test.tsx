import { LocalizeContextProps } from "react-localize-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { TreeView, TreeViewProps } from "components/TreeView/TreeViewComponent";
import MockDomain from "components/TreeView/tests/MockSemanticDomain";
import { newWritingSystem } from "types/project";

var treeMaster: ReactTestRenderer;
var treeHandle: TreeView;

const RETURN_MOCK = jest.fn();
const NAVIGATE_MOCK = jest.fn();

// Mock out Zoom to avoid issues with portals
jest.mock("@material-ui/core", () => {
  const realMaterialUi = jest.requireActual("@material-ui/core");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});

// Mock createDomains
jest.mock("components/TreeView/TreeViewReducer", () => {
  const realReducer = jest.requireActual("components/TreeView/TreeViewReducer");
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

describe("TreeView", () => {
  it("Constructs correctly to match snapshot", () => {
    createTree();
    snapTest();
  });

  // This assumes MockDomain was used in createTree() below and MockDomain.name !== ""
  it("Navigates to .currentDomain in construction", () => {
    createTree();
    expect(NAVIGATE_MOCK).toHaveBeenCalledTimes(1);
    expect(NAVIGATE_MOCK).toHaveBeenCalledWith(MockDomain);
  });

  it("Sets a new domain upon navigation", async () => {
    const newDom = new TreeSemanticDomain("test", "test");
    newDom.description = "super testy";

    await treeHandle.animate(newDom);
    expect(NAVIGATE_MOCK).toHaveBeenCalledWith(newDom);
  });

  it("Returns control to caller when the same semantic domain is passed in", async () => {
    await treeHandle.animate(MockDomain);
    expect(RETURN_MOCK).toHaveBeenCalledTimes(1);
  });
});

const treeViewProps: TreeViewProps = {
  semDomWritingSystem: newWritingSystem(),
  currentDomain: MockDomain,
  returnControlToCaller: RETURN_MOCK,
  navigateTree: NAVIGATE_MOCK,
};

const localizeProps = {
  activeLanguage: { code: "" },
} as LocalizeContextProps;

function createTree(): void {
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeView {...treeViewProps} {...localizeProps} />
    );
  });
  treeHandle = treeMaster.root.findByType(TreeView).instance;
}

function snapTest(): void {
  expect(treeMaster.toJSON()).toMatchSnapshot();
}
