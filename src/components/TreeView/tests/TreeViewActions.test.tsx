import { TraverseTreeAction, TreeActionType } from "../TreeViewActions";
import SemanticDomain from "../SemanticDomain";

describe("Test TraverseTreeAction", () => {
  it("Creates the right action", () => {
    const domain = {};
    expect(TraverseTreeAction(domain as SemanticDomain)).toEqual({
      type: TreeActionType.TRAVERSE_TREE,
      payload: domain
    });
  });
});
