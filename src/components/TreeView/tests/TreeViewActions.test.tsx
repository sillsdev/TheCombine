import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
  setDomainLanguageAction,
  traverseTreeAction,
} from "components/TreeView/TreeViewActions";
import { defaultState } from "components/TreeView/TreeViewReducer";
import { TreeActionType } from "components/TreeView/TreeViewReduxTypes";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

jest.mock("backend", () => ({
  getSemanticDomainTreeNode: (id: string, lang: string) =>
    mockGetSemDomTreeNode(id, lang),
}));

const mockGetSemDomTreeNode = jest.fn();

// Mock the track and identify methods of segment analytics.
global.analytics = { identify: jest.fn(), track: jest.fn() } as any;

const createMockStore = configureMockStore([thunk]);
const mockState = defaultState;

describe("TraverseTreeAction", () => {
  it("SetDomainLanguage returns correct action", async () => {
    const language = "lang";
    const action = {
      type: TreeActionType.SET_DOMAIN_LANGUAGE,
      language,
    };
    const mockStore = createMockStore(mockState);
    await mockStore.dispatch<any>(setDomainLanguageAction("lang"));
    expect(mockStore.getActions()).toEqual([action]);
  });

  it("TraverseTreeAction dispatches on successful", async () => {
    const mockDomainReturned = newSemanticDomainTreeNode("id", "name");
    mockGetSemDomTreeNode.mockResolvedValue(mockDomainReturned);
    const domain = { id: "id", name: "name", guid: "", lang: "" };
    const action = {
      type: TreeActionType.SET_CURRENT_DOMAIN,
      domain: mockDomainReturned,
    };
    const mockStore = createMockStore(mockState);

    await mockStore.dispatch<any>(traverseTreeAction(domain));
    expect(mockStore.getActions()).toEqual([action]);
  });

  it("TraverseTreeAction does not dispatch on null return", async () => {
    mockGetSemDomTreeNode.mockResolvedValue(undefined);
    const domain = { id: "id", name: "name", guid: "", lang: "" };
    const mockStore = createMockStore(mockState);

    await mockStore.dispatch<any>(traverseTreeAction(domain));
    expect(mockStore.getActions()).toEqual([]);
  });
});
