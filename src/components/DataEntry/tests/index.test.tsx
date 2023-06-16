import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import createMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { SemanticDomainFull } from "api/models";
import * as backend from "backend";
import DataEntry from "components/DataEntry";
import { openTreeAction } from "components/TreeView/TreeViewActions";
import { TreeViewState } from "components/TreeView/TreeViewReducer";
import { TreeViewAction } from "components/TreeView/TreeViewReduxTypes";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

jest.mock("components/DataEntry/DataEntryTable", () => "div");
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => mockDispatch,
  };
});

const mockDispatch = jest.fn((action: TreeViewAction) => action);
const mockDomain = newSemanticDomainTreeNode("mockId", "mockName", "mockLang");
const mockStore = createMockStore();

let testHandle: renderer.ReactTestRenderer;

function spyOnGetSemanticDomainFull(
  domain?: SemanticDomainFull
): jest.SpyInstance {
  return jest.spyOn(backend, "getSemanticDomainFull").mockResolvedValue(domain);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DataEntry", () => {
  it("opens the tree", async () => {
    await renderDataEntry({ currentDomain: mockDomain });
    expect(mockDispatch).toHaveBeenCalledWith(openTreeAction());
  });

  it("fetches domain", async () => {
    const spyHandle = spyOnGetSemanticDomainFull();
    await renderDataEntry({ currentDomain: mockDomain });
    expect(spyHandle).toBeCalledWith(mockDomain.id, mockDomain.lang);
  });
});

async function renderDataEntry(
  mockState: Partial<TreeViewState>
): Promise<void> {
  await renderer.act(async () => {
    testHandle = renderer.create(
      <Provider store={mockStore({ treeViewState: mockState })}>
        <DataEntry />
      </Provider>
    );
  });
}
