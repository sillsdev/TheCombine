import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Key } from "ts-key-enum";

import "tests/reactI18nextMock";

import TreeSearch from "components/TreeView/TreeSearch";
import TreeView, { exitButtonId } from "components/TreeView/TreeViewComponent";
import { defaultState as treeViewState } from "components/TreeView/TreeViewReducer";
import mockMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";
import { newWritingSystem } from "types/writingSystem";

let treeMaster: renderer.ReactTestRenderer;

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

jest.mock("components/TreeView/TreeDepiction");

beforeAll(async () => {
  await renderer.act(async () => {
    treeMaster = renderer.create(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} />
      </Provider>
    );
  });
});

describe("TreeView", () => {
  it("renders", async () => {
    const treeSearch = treeMaster.root.findByType(TreeSearch);
    expect(treeSearch).toBeTruthy();
  });

  it("exits via exit button", async () => {
    const mockExit = jest.fn();
    await updateTree(mockExit);
    expect(mockExit).not.toBeCalled();
    const exitButton = treeMaster.root.findByProps({ id: exitButtonId });
    renderer.act(() => {
      exitButton.props.onClick();
    });
    expect(mockExit).toBeCalledTimes(1);
  });

  it("exits via escape key", async () => {
    const mockExit = jest.fn();
    await updateTree(mockExit);
    expect(mockExit).not.toBeCalled();
    renderer.act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: Key.Escape }));
    });
    expect(mockExit).toBeCalledTimes(1);
  });
});

async function updateTree(exit?: () => void): Promise<void> {
  await renderer.act(async () => {
    treeMaster.update(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} exit={exit} />
      </Provider>
    );
  });
}
