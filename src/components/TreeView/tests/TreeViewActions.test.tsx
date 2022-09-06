import {
  setDomainLanguageAction,
  traverseTreeAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { DomainMap, TreeSemanticDomain } from "types/semanticDomain";

describe("TraverseTreeAction", () => {
  it("SetDomainMapAction returns correct action", () => {
    const language = "lang";
    const domain = new TreeSemanticDomain("id", "name");
    const domainMap = { [domain.id]: domain };
    const action = {
      type: TreeActionType.SET_DOMAIN_LANGUAGE,
      domainMap,
      language,
    };
    expect(setDomainLanguageAction(language)).toEqual(action);
  });

  it("TraverseTreeAction returns correct action", () => {
    const domain = new TreeSemanticDomain("id", "name");
    const action = { type: TreeActionType.TRAVERSE_TREE, domain };
    expect(traverseTreeAction(domain)).toEqual(action);
  });
});
