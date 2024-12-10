import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import createMockStore from "redux-mock-store";

import DataEntry, {
  smallScreenThreshold,
  treeViewDialogId,
} from "components/DataEntry";
import { defaultState as currentProjectState } from "components/Project/ProjectReduxTypes";
import { openTree } from "components/TreeView/Redux/TreeViewActions";
import { TreeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import { newSemanticDomainTreeNode } from "types/semanticDomain";
import * as useWindowSize from "utilities/useWindowSize";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...jest.requireActual("@mui/material"),
    Dialog: materialUiCore.Container,
  };
});

jest.mock("backend", () => ({
  getSemanticDomainFull: (...args: any[]) => mockGetSemanticDomainFull(...args),
}));
jest.mock("components/AppBar", () => "div");
jest.mock("components/DataEntry/DataEntryTable", () => "div");
jest.mock("components/TreeView", () => "div");
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => mockDispatch,
  };
});

const mockDispatch = jest.fn((action: any) => action);
const mockDomain = newSemanticDomainTreeNode("mockId", "mockName", "mockLang");
const mockGetSemanticDomainFull = jest.fn();
const mockStore = createMockStore();

function spyOnUseWindowSize(windowWidth: number): jest.SpyInstance {
  return jest
    .spyOn(useWindowSize, "useWindowSize")
    .mockReturnValue({ windowWidth, windowHeight: 1 });
}

let testHandle: renderer.ReactTestRenderer;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSemanticDomainFull.mockResolvedValue(undefined);
});

describe("DataEntry", () => {
  it("displays TreeView when state says the tree is open", async () => {
    await renderDataEntry({ currentDomain: mockDomain, open: true });
    const dialog = testHandle.root.findByProps({ id: treeViewDialogId });
    expect(dialog.props.open).toBeTruthy();
  });

  it("doesn't displays TreeView when state says the tree is closed", async () => {
    await renderDataEntry({ currentDomain: mockDomain, open: false });
    const dialog = testHandle.root.findByProps({ id: treeViewDialogId });
    expect(dialog.props.open).toBeFalsy();
  });

  it("dispatches to open the tree", async () => {
    await renderDataEntry({ currentDomain: mockDomain });
    expect(mockDispatch).toHaveBeenCalledWith(openTree());
  });

  it("fetches domain", async () => {
    await renderDataEntry({ currentDomain: mockDomain });
    expect(mockGetSemanticDomainFull).toHaveBeenCalledWith(
      mockDomain.id,
      mockDomain.lang
    );
  });

  it("renders on a small screen", async () => {
    await renderDataEntry(
      { currentDomain: mockDomain },
      smallScreenThreshold - 1
    );
  });
});

async function renderDataEntry(
  treeViewState: Partial<TreeViewState>,
  windowWidth = smallScreenThreshold + 1
): Promise<void> {
  spyOnUseWindowSize(windowWidth);
  await renderer.act(async () => {
    testHandle = renderer.create(
      <Provider store={mockStore({ currentProjectState, treeViewState })}>
        <DataEntry />
      </Provider>
    );
  });
}
