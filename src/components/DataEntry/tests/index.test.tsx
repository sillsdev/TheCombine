import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import DataEntry, { smallScreenThreshold } from "components/DataEntry";
import { openTree } from "components/TreeView/Redux/TreeViewActions";
import { TreeViewState } from "components/TreeView/Redux/TreeViewReduxTypes";
import { defaultState } from "rootRedux/types";
import { newSemanticDomainTreeNode } from "types/semanticDomain";
import * as useWindowSize from "utilities/useWindowSize";

jest.mock("backend", () => ({
  getSemanticDomainFull: (...args: any[]) => mockGetSemanticDomainFull(...args),
}));
jest.mock("components/AppBar", () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock("components/DataEntry/DataEntryTable", () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock("components/TreeView", () => ({
  __esModule: true,
  default: () => <div />,
}));
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

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSemanticDomainFull.mockResolvedValue(undefined);
});

describe("DataEntry", () => {
  it("displays TreeView when state says the tree is open", async () => {
    await renderDataEntry({ currentDomain: mockDomain, open: true });
    expect(screen.queryByRole("dialog")).toBeTruthy();
  });

  it("doesn't displays TreeView when state says the tree is closed", async () => {
    await renderDataEntry({ currentDomain: mockDomain, open: false });
    expect(screen.queryByRole("dialog")).toBeFalsy();
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
  await act(async () => {
    render(
      <Provider
        store={mockStore({
          ...defaultState,
          treeViewState: { ...defaultState.treeViewState, ...treeViewState },
        })}
      >
        <DataEntry />
      </Provider>
    );
  });
}
