import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Key } from "ts-key-enum";

import TreeView, { exitButtonId, topButtonId } from "components/TreeView";
import { defaultState as treeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
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

jest.mock("types/hooks", () => {
  const realHooks = jest.requireActual("types/hooks");
  return {
    ...realHooks,
    useAppDispatch: () => jest.fn(),
  };
});

const mockStore = configureMockStore([thunk])({
  treeViewState: { ...treeViewState, currentDomain: mockMap[mapIds.parent] },
  currentProjectState: {
    project: { semDomWritingSystem: newWritingSystem() },
  },
});

const findById = (id: string): renderer.ReactTestInstance =>
  treeMaster.root.findByProps({ id });

describe("TreeView", () => {
  it("renders with top button and no exit button by default", async () => {
    await renderTree();
    expect(() => findById(topButtonId)).not.toThrow();
    expect(() => findById(exitButtonId)).toThrow();
  });

  it("exits via exit button", async () => {
    const mockExit = jest.fn();
    await renderTree(mockExit);
    expect(mockExit).not.toHaveBeenCalled();
    renderer.act(() => {
      findById(exitButtonId).props.onClick();
    });
    expect(mockExit).toHaveBeenCalledTimes(1);
  });

  it("exits via escape key", async () => {
    const mockExit = jest.fn();
    await renderTree(mockExit);
    expect(mockExit).not.toHaveBeenCalled();
    renderer.act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: Key.Escape }));
    });
    expect(mockExit).toHaveBeenCalledTimes(1);
  });
});

async function renderTree(exit?: () => void): Promise<void> {
  await renderer.act(async () => {
    treeMaster = renderer.create(
      <Provider store={mockStore}>
        <TreeView returnControlToCaller={jest.fn()} exit={exit} />
      </Provider>
    );
  });
}
