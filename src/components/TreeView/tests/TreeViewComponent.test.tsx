import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import "tests/reactI18nextMock";

import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeView from "components/TreeView/TreeViewComponent";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";
import mockMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";
import { newWritingSystem } from "types/writingSystem";

let treeMaster: renderer.ReactTestRenderer;
let treeHandle: renderer.ReactTestInstance;

// Mock out Zoom to avoid issues with portals
jest.mock("@mui/material", () => {
  const realMaterialUi = jest.requireActual("@mui/material");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});
const mockStore = configureMockStore([thunk])({
  treeViewState: { ...treeViewState, currentDomain: mockMap[mapIds.parent] },
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
    treeMaster = renderer.create(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} />
      </Provider>
    );
  });
  treeHandle = treeMaster.root.findByType(TreeDepiction).instance;
}
