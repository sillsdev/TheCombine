import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import createMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import DataEntry, { smallScreenThreshold } from "components/DataEntry";
import { openTreeAction } from "components/TreeView/Redux/TreeViewActions";
import {
  TreeViewAction,
  TreeViewState,
} from "components/TreeView/Redux/TreeViewReduxTypes";
import { newSemanticDomainTreeNode } from "types/semanticDomain";
import * as useWindowSize from "utilities/useWindowSize";

jest.mock("backend", () => ({
  getSemanticDomainFull: (...args: any[]) => mockGetSemanticDomainFull(...args),
}));
jest.mock("components/DataEntry/DataEntryTable", () => "div");
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => mockDispatch,
  };
});

const mockDispatch = jest.fn((action: TreeViewAction) => action);
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
  it("opens the tree", async () => {
    await renderDataEntry({ currentDomain: mockDomain });
    expect(mockDispatch).toHaveBeenCalledWith(openTreeAction());
  });

  it("fetches domain", async () => {
    await renderDataEntry({ currentDomain: mockDomain });
    expect(mockGetSemanticDomainFull).toBeCalledWith(
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
  mockState: Partial<TreeViewState>,
  windowWidth = smallScreenThreshold + 1
): Promise<void> {
  spyOnUseWindowSize(windowWidth);
  await renderer.act(async () => {
    renderer.create(
      <Provider store={mockStore({ treeViewState: mockState })}>
        <DataEntry />
      </Provider>
    );
  });
}
