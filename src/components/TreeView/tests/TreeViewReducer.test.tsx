import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
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
  it("Creates a SemanticDomain from a JSON string using createDomains", () => {
    const parent = {
      name: "Foo",
      id: "x",
      description: "foo description",
      questions: [],
    };
    const subdomains = [
      {
        name: "Bar",
        id: "x.1",
        description: "bar desc",
        subdomains: [],
        questions: [],
      },
      {
        name: "Baz",
        id: "x.2",
        description: "baz desc",
        subdomains: [],
        questions: [],
      },
    ];
    const initialJson = [
      {
        ...parent,
        subdomains: subdomains,
      },
    ];
    let expectedDomain = {
      name: "",
      id: "",
      description: "",
      subdomains: [
        { ...parent, parentDomain: {}, subdomains: [...subdomains] },
      ],
      questions: [],
    };
    expectedDomain.subdomains[0].subdomains.map((value) => {
      return {
        ...value,
        parentDomains: expectedDomain.subdomains[0],
      };
    });
    expectedDomain.subdomains[0].parentDomain = expectedDomain;
    expect(createDomains(initialJson)).toEqual(expectedDomain);
  });

  it("Returns defaultState when passed undefined", () => {
    expect(treeViewReducer(undefined, {} as TreeViewAction)).toEqual(
      defaultState
    );
  });

  it("Returns default state when reset action is passed", () => {
    const action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

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
        payload,
      })
    ).toEqual({ ...defaultState, currentDomain: payload });
  });
});
