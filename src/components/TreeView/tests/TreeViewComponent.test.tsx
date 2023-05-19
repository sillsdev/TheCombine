import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import "tests/reactI18nextMock";

import TreeView, {
  exitButtonId,
  topButtonId,
} from "components/TreeView/TreeViewComponent";
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

jest.mock("components/TreeView/TreeDepiction");

const mockStore = configureMockStore([thunk])({
  treeViewState: { ...treeViewState, currentDomain: mockMap[mapIds.parent] },
  currentProjectState: {
    project: { semDomWritingSystem: newWritingSystem() },
  },
});

const findById = (id: string): renderer.ReactTestInstance =>
  treeMaster.root.findByProps({ id });

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
  it("renders with top button and no exit button by default", () => {
    expect(() => findById(topButtonId)).not.toThrow();
    expect(() => findById(exitButtonId)).toThrow();
  });

  it("exits via exit button", async () => {
    const mockExit = jest.fn();
    await updateTree(mockExit);
    expect(mockExit).not.toBeCalled();
    renderer.act(() => {
      findById(exitButtonId).props.onClick();
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
