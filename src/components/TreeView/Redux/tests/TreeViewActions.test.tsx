import { PreloadedState } from "redux";

import { defaultState } from "Redux/rootReduxTypes";
import { RootState, setupStore } from "Redux/store";
import {
  initTreeDomain,
  setDomainLanguage,
  traverseTree,
} from "components/TreeView/Redux/TreeViewActions";
import {
  newSemanticDomain,
  newSemanticDomainTreeNode,
} from "types/semanticDomain";

jest.mock("backend", () => ({
  getSemanticDomainTreeNode: (...args: any[]) => mockGetSemDomTreeNode(...args),
}));

const mockGetSemDomTreeNode = jest.fn();

// Mock the track and identify methods of segment analytics.
global.analytics = { identify: jest.fn(), track: jest.fn() } as any;

const mockId = "id";
const mockLang = "lang";

// Preloaded values for store when testing
const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { version: 1, rehydrated: false },
};

describe("TreeViewActions", () => {
  describe("setDomainLanguage", () => {
    it("correctly affects state", async () => {
      const store = setupStore();
      store.dispatch(setDomainLanguage(mockLang));
      const { currentDomain, language } = store.getState().treeViewState;
      expect(currentDomain.lang).toEqual(mockLang);
      expect(language).toEqual(mockLang);
    });
  });

  describe("traverseTree", () => {
    it("dispatches on successful", async () => {
      const store = setupStore();
      const dom = newSemanticDomain(mockId);
      mockGetSemDomTreeNode.mockResolvedValue(dom);
      await store.dispatch(traverseTree(dom));
      const { currentDomain } = store.getState().treeViewState;
      expect(currentDomain.id).toEqual(mockId);
    });

    it("does not dispatch on undefined", async () => {
      const store = setupStore();
      mockGetSemDomTreeNode.mockResolvedValue(undefined);
      await store.dispatch(traverseTree(newSemanticDomain(mockId)));
      const { currentDomain } = store.getState().treeViewState;
      expect(currentDomain.id).not.toEqual(mockId);
    });
  });

  describe("initTreeDomain", () => {
    it("changes domain lang but not id", async () => {
      const nonDefaultState = {
        currentDomain: newSemanticDomainTreeNode(mockId),
        language: "",
        open: true,
      };
      const store = setupStore({
        ...persistedDefaultState,
        treeViewState: nonDefaultState,
      });
      await store.dispatch(initTreeDomain(mockLang));
      expect(mockGetSemDomTreeNode).toBeCalledWith(mockId, mockLang);
    });
  });
});
