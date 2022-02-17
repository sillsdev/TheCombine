import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import {
  treeViewReducer,
  defaultState,
  TreeViewState,
  createDomains,
} from "components/TreeView/TreeViewReducer";
import { StoreAction, StoreActionTypes } from "rootActions";

describe("Test the TreeViewReducer", () => {
  it("Creates currentDomain and domainMap from JSON data using createDomains", () => {
    // The json data loaded in doesn't have childIds.
    const parent = new TreeSemanticDomain("Foo", "5") as any;
    delete parent.childIds;
    const subdomains = [
      new TreeSemanticDomain("Bar", "5.1") as any,
      new TreeSemanticDomain("Baz", "5.2") as any,
    ];
    delete subdomains[0].childIds;
    delete subdomains[1].childIds;
    const initialJson = [{ ...parent, subdomains } as TreeSemanticDomain];

    // Any parentId and childIds are to be generated.
    const expectedDomain: TreeSemanticDomain = {
      name: "",
      id: "",
      description: "",
      subdomains: [],
      questions: [],
      childIds: [parent.id],
    };
    const expectedMap: DomainMap = {
      "": expectedDomain,
      [parent.id]: {
        ...parent,
        subdomains: [],
        parentId: "",
        childIds: [subdomains[0].id, subdomains[1].id],
      },
      [subdomains[0].id]: {
        ...subdomains[0],
        parentId: parent.id,
        childIds: [],
      },
      [subdomains[1].id]: {
        ...subdomains[1],
        parentId: parent.id,
        childIds: [],
      },
    };
    const expectedState: TreeViewState = {
      currentDomain: expectedDomain,
      domainMap: expectedMap,
    };
    expect(createDomains(initialJson)).toEqual(expectedState);
  });

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
          currentDomain: defaultState.currentDomain.subdomains[0],
        },
        { type: "Nothing" } as any as TreeViewAction
      )
    ).toEqual({
      ...defaultState,
      currentDomain: defaultState.currentDomain.subdomains[0],
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
    const payload = new TreeSemanticDomain("testId", "testName");
    expect(
      treeViewReducer(defaultState, {
        type: TreeActionType.TRAVERSE_TREE,
        domain: payload,
      })
    ).toEqual({ ...defaultState, currentDomain: payload });
  });
});
