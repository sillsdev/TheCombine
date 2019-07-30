import { TraverseTreeAction, TreeActionType } from "../TreeViewActions";
import SemanticDomainWithSubdomains from "../SemanticDomain";

describe("Test TraverseTreeAction", () => {
  it("Creates the right action", () => {
    const domain = {};
    expect(TraverseTreeAction(domain as SemanticDomainWithSubdomains)).toEqual({
      type: TreeActionType.TRAVERSE_TREE,
      payload: domain
    });
  });
});
