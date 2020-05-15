import {
  treeViewReducer,
  defaultState,
  TreeViewState,
  createDomains,
} from "../TreeViewReducer";
import { TreeViewAction, TreeActionType } from "../TreeViewActions";
import SemanticDomainWithSubdomains from "../SemanticDomain";
import { StoreAction, StoreActions } from "../../../rootActions";

describe("Test the TreeViewReducer", () => {
  it("Creates a SemanticDomain from a JSON string using createDomains", () => {
    const parent = {
      name: "Foo",
      id: "x",
      description: "foo description",
    };
    const subdomains = [
      { name: "Bar", id: "x.1", description: "bar desc", subdomains: [] },
      { name: "Baz", id: "x.2", description: "baz desc", subdomains: [] },
    ];
    const initialJson = [
      {
        ...parent,
        subdomains: subdomains,
      },
    ];
    let expected = {
      currentdomain: {
        name: "",
        id: "",
        description: "",
        subdomains: [
          {
            ...parent,
            parentDomain: {},
            subdomains: [...subdomains],
          },
        ],
      },
    };
    expected.currentdomain.subdomains[0].subdomains.map((value) => {
      return {
        ...value,
        parentDomains: expected.currentdomain.subdomains[0],
      };
    });
    expected.currentdomain.subdomains[0].parentDomain = expected.currentdomain;
    expect(createDomains(initialJson)).toEqual(expected);
  });

  it("Returns defaultState when passed undefined", () => {
    expect(treeViewReducer(undefined, {} as TreeViewAction)).toEqual(
      defaultState
    );
  });

  it("Returns default state when reset action is passed", () => {
    const action: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(treeViewReducer({} as TreeViewState, action)).toEqual(defaultState);
  });

  it("Returns state passed in when passed an invalid action", () => {
    expect(
      treeViewReducer(
        { currentdomain: defaultState.currentdomain.subdomains[0] },
        ({ type: "Nothing" } as any) as TreeViewAction
      )
    ).toEqual({ currentDomain: defaultState.currentdomain.subdomains[0] });
  });

  it("Returns state with a new SemanticDomain when requested to change this value", () => {
    let payload: SemanticDomainWithSubdomains = defaultState.currentdomain
      .parentDomain as SemanticDomainWithSubdomains;
    expect(
      treeViewReducer(defaultState, {
        type: TreeActionType.TRAVERSE_TREE,
        payload: payload,
      })
    );
  });
});
