import { LocalizeContextProps } from "react-localize-redux";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { TreeView, TreeViewProps } from "components/TreeView/TreeViewComponent";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";
import mockDomain, {
  parMap as mockMap,
} from "components/TreeView/tests/MockSemanticDomain";
import { newProject } from "types/project";

var treeMaster: ReactTestRenderer;
var treeHandle: ReactTestInstance;

const mockReturnControlToCaller = jest.fn();
const mockSetDomainMapAction = jest.fn();
const mockTraverseTreeAction = jest.fn();

// Mock out Zoom to avoid issues with portals
jest.mock("@material-ui/core", () => {
  const realMaterialUi = jest.requireActual("@material-ui/core");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});

// Mock actions
jest.mock("components/TreeView/TreeViewActions", () => {
  const realActions = jest.requireActual("components/TreeView/TreeViewActions");
  return {
    ...realActions,
    SetDomainMapAction: () => mockSetDomainMapAction(),
    TraverseTreeAction: () => mockTraverseTreeAction(),
  };
});

// Mock reducer
jest.mock("components/TreeView/TreeViewReducer", () => {
  const realReducer = jest.requireActual("components/TreeView/TreeViewReducer");
  return {
    ...realReducer,
    createDomains: () => {
      return { currentDomain: mockDomain, domainMap: mockMap };
    },
  };
});

const mockStore = configureMockStore()({
  treeViewState,
  currentProjectState: { project: newProject() },
});

beforeAll(() => {
  createTree();
});

beforeEach(() => {
  mockReturnControlToCaller.mockClear();
  mockSetDomainMapAction.mockClear();
  mockTraverseTreeAction.mockClear();
});

describe("TreeView", () => {
  it("Constructs correctly to match snapshot", () => {
    createTree();
    snapTest();
  });

  // This assumes MockDomain was used in createTree() below and MockDomain.name !== ""
  it("Navigates to .currentDomain in construction", () => {
    createTree();
    expect(mockSetDomainMapAction).toHaveBeenCalledTimes(1);
    expect(mockTraverseTreeAction).toHaveBeenCalledTimes(1);
    expect(mockTraverseTreeAction).toHaveBeenCalledWith(mockDomain);
  });

  it("Sets a new domain upon navigation", async () => {
    const newDom = new TreeSemanticDomain("test", "test");
    newDom.description = "super testy";

    await (treeHandle as any).animate(newDom);
    expect(mockTraverseTreeAction).toHaveBeenCalledWith(newDom);
  });

  it("Returns control to caller when the same semantic domain is passed in", async () => {
    await (treeHandle as any).animate(mockDomain);
    expect(mockReturnControlToCaller).toHaveBeenCalledTimes(1);
  });
});

const treeViewProps: TreeViewProps = {
  returnControlToCaller: mockReturnControlToCaller,
};
const localizeProps = {
  activeLanguage: { code: "" },
  translate: (() => "TranslatedString") as LocalizeContextProps["translate"],
} as LocalizeContextProps;
function createTree(): void {
  renderer.act(() => {
    treeMaster = renderer.create(
      <Provider store={mockStore}>
        <TreeView {...treeViewProps} {...localizeProps} />
      </Provider>
    );
  });
  treeHandle = treeMaster.root.findByType(TreeView).instance;
}

function snapTest(): void {
  expect(treeMaster.toJSON()).toMatchSnapshot();
}
