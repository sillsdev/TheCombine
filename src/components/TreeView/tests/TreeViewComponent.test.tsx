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
jest.mock("@mui/material", () => {
  const realMaterialUi = jest.requireActual("@mui/material");
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

describe("TreeView", () => {
  it("Renders without crashing", async () => {
    await createTree();
    expect(treeHandle).toBeTruthy();
  });
});

async function createTree(): Promise<void> {
  await renderer.act(async () => {
    treeMaster = await renderer.create(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} />
      </Provider>
    );
  });
  treeHandle = treeMaster.root.findByType(TreeDepiction).instance;
}
