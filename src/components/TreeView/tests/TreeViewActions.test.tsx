import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import {
  TraverseTreeAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";

describe("TraverseTreeAction", () => {
  it("Creates the right action", () => {
    const domain = {};
    expect(TraverseTreeAction(domain as TreeSemanticDomain)).toEqual({
      type: TreeActionType.TRAVERSE_TREE,
      payload: domain,
    });
  });
});
