import {
  treeViewReducer,
  defaultState,
  TreeViewState
} from "../TreeViewReducer";
import { TreeViewAction, TreeActionType } from "../TreeViewActions";
import SemanticDomain from "../SemanticDomain";
import { StoreAction, StoreActions } from "../../../rootActions";

describe("Test the TreeViewReducer", () => {
  it("Returns defaultState when passed undefined", () => {
    expect(treeViewReducer(undefined, {} as TreeViewAction)).toEqual(
      defaultState
    );
  });

  it("Returns default state when reset action is passed", () => {
    const state: TreeViewState = {
      currentDomain: {
        name: "",
        number: "",
        subDomains: []
      }
    };

    const action: StoreAction = {
      type: StoreActions.RESET
    };

    expect(treeViewReducer(state, action)).toEqual(defaultState);
  });

  it("Returns state passed in when passed an invalid action", () => {
    expect(
      treeViewReducer(
        { currentDomain: defaultState.currentDomain.subDomains[0] },
        ({ type: "Nothing" } as any) as TreeViewAction
      )
    ).toEqual({ currentDomain: defaultState.currentDomain.subDomains[0] });
  });

  it("Returns state with a new SemanticDomain when requested to change this value", () => {
    let payload: SemanticDomain = defaultState.currentDomain
      .parentDomain as SemanticDomain;
    expect(
      treeViewReducer(defaultState, {
        type: TreeActionType.TRAVERSE_TREE,
        payload: payload
      })
    );
  });
});
