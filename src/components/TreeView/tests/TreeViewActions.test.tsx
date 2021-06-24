import {
  TraverseTreeAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

describe("TraverseTreeAction", () => {
  it("Creates the right action", () => {
    const domain = {};
    expect(TraverseTreeAction(domain as TreeSemanticDomain)).toEqual({
      type: TreeActionType.TRAVERSE_TREE,
      payload: domain,
    });
  });
});
