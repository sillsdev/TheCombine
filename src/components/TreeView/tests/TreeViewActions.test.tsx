import {
  createDomainMap,
  setDomainMapAction,
  traverseTreeAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { DomainMap, TreeSemanticDomain } from "types/semanticDomain";

describe("TraverseTreeAction", () => {
  it("SetDomainMapAction returns correct action", () => {
    const language = "lang";
    const domain = new TreeSemanticDomain("id", "name");
    const domainMap = { [domain.id]: domain };
    const action = { type: TreeActionType.SET_DOMAIN_MAP, domainMap, language };
    expect(setDomainMapAction(domainMap, language)).toEqual(action);
  });

  it("TraverseTreeAction returns correct action", () => {
    const domain = new TreeSemanticDomain("id", "name");
    const action = { type: TreeActionType.TRAVERSE_TREE, domain };
    expect(traverseTreeAction(domain)).toEqual(action);
  });

  it("createDomainMap returns correct map from JSON data", () => {
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
    const expectedMap: DomainMap = {
      "": { ...new TreeSemanticDomain(), childIds: [parent.id] },
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
    expect(createDomainMap(initialJson)).toEqual(expectedMap);
  });
});
