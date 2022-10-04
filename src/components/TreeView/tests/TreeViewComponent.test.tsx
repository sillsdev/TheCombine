import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import "tests/mockReactI18next";

import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeView from "components/TreeView/TreeViewComponent";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";
import mockMap, { mapIds } from "components/TreeView/tests/MockSemanticDomain";
import { newWritingSystem } from "types/writingSystem";

var treeMaster: ReactTestRenderer;
var treeHandle: ReactTestInstance;

// Mock out Zoom to avoid issues with portals
jest.mock("@material-ui/core", () => {
  const realMaterialUi = jest.requireActual("@material-ui/core");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});
const mockStore = configureMockStore([thunk])({
  treeViewState: {
    ...treeViewState,
    currentDomain: mockMap[mapIds.parent],
  },
  currentProjectState: {
    project: { semDomWritingSystem: newWritingSystem() },
  },
});

beforeAll(() => {
  createTree();
});

describe("TreeView", () => {
  it("Renders without crashing", () => {
    createTree();
    expect(treeHandle).toBeTruthy();
  });
});

function createTree(): void {
  renderer.act(() => {
    treeMaster = renderer.create(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} />
      </Provider>
    );
  });
  treeHandle = treeMaster.root.findByType(TreeDepiction).instance;
}
