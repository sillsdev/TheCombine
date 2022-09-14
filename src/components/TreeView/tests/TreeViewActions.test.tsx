import {
  setDomainLanguageAction,
  traverseTreeAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { newSemanticDomainTreeNode } from "types/semanticDomain";
import * as backend from "backend";

describe("TraverseTreeAction", () => {
  it("SetDomainLanguage returns correct action", () => {
    const language = "lang";
    const action = {
      type: TreeActionType.SET_DOMAIN_LANGUAGE,
      language,
    };
    expect(setDomainLanguageAction(language)).toEqual(action);
  });

  it("TraverseTreeAction dispatches on successful", () => {
    jest
      .spyOn(backend, "getSemanticDomainTreeNode")
      .mockResolvedValue(newSemanticDomainTreeNode("id", "name"));
    const domain = { id: "id", name: "name", guid: "", lang: "" };
    const action = { type: TreeActionType.TRAVERSE_TREE, domain };
    expect(traverseTreeAction(domain)).toEqual(action);
  });

  it("TraverseTreeAction does not dispatch on null return", () => {
    jest
      .spyOn(backend, "getSemanticDomainTreeNode")
      .mockResolvedValue(undefined);
    const domain = newSemanticDomainTreeNode("id", "name");
    const action = { type: TreeActionType.TRAVERSE_TREE, domain };
    expect(traverseTreeAction(domain)).toEqual(action);
  });
});
