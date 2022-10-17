import {
  treeViewReducer,
  defaultState,
  TreeViewState,
} from "components/TreeView/TreeViewReducer";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

describe("Test the TreeViewReducer", () => {
  it("Returns defaultState when passed undefined", () => {
    expect(treeViewReducer(undefined, {} as TreeViewAction)).toEqual(
      defaultState
    );
  });

  it("Returns default state when reset action is passed", () => {
    const action: StoreAction = { type: StoreActionTypes.RESET };

    expect(treeViewReducer({} as TreeViewState, action)).toEqual(defaultState);
  });

  it("Returns state passed in when passed an invalid action", () => {
    expect(
      treeViewReducer(
        {
          ...defaultState,
          currentDomain: defaultState.currentDomain,
        },
        { type: "Nothing" } as any as TreeViewAction
      )
    ).toEqual({
      ...defaultState,
      currentDomain: defaultState.currentDomain,
    });
  });

  it("Closes the tree when requested", () => {
    expect(
      treeViewReducer(
        { ...defaultState, open: true },
        { type: TreeActionType.CLOSE_TREE }
      )
    ).toEqual({ ...defaultState, open: false });
  });

  it("Opens the tree when requested", () => {
    expect(
      treeViewReducer(
        { ...defaultState, open: false },
        { type: TreeActionType.OPEN_TREE }
      )
    ).toEqual({ ...defaultState, open: true });
  });

  it("Returns state with a new SemanticDomain when requested to change this value", () => {
    const payload = newSemanticDomainTreeNode("testId", "testName");
    expect(
      treeViewReducer(defaultState, {
        type: TreeActionType.SET_CURRENT_DOMAIN,
        domain: payload,
      })
    ).toEqual({ ...defaultState, currentDomain: payload });
  });
});
