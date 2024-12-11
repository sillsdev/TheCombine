import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Key } from "ts-key-enum";

import TreeView, { exitButtonId, topButtonId } from "components/TreeView";
import { defaultState as treeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import mockMap, { mapIds } from "components/TreeView/tests/SemanticDomainMock";
import theme from "types/theme";
import { newWritingSystem } from "types/writingSystem";
import { setMatchMedia } from "utilities/testRendererUtilities";

let treeMaster: renderer.ReactTestRenderer;

// Mock out Zoom to avoid issues with portals
jest.mock("@mui/material", () => {
  const realMaterialUi = jest.requireActual("@mui/material");
  return {
    ...realMaterialUi,
    Zoom: realMaterialUi.Container,
  };
});

jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
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

const muiSM = 600;

describe("TreeView", () => {
  it("renders without top button in xs windows", async () => {
    await renderTree(undefined, muiSM - 1);
    expect(() => findById(topButtonId)).toThrow();
  });

  it("renders with top button in sm+ windows", async () => {
    await renderTree(undefined, muiSM);
    expect(() => findById(topButtonId)).not.toThrow();
  });

  it("renders with no exit button by default", async () => {
    await renderTree();
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

async function renderTree(exit?: () => void, width?: number): Promise<void> {
  // Required (along with a `ThemeProvider`) for `useMediaQuery` to work
  setMatchMedia(width);

  await renderer.act(async () => {
    treeMaster = renderer.create(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <TreeView returnControlToCaller={jest.fn()} exit={exit} />
        </Provider>
      </ThemeProvider>
    );
  });
}
