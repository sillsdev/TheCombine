import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export enum TreeActionType {
  TRAVERSE_TREE = "traverseTree",
}

export interface TreeViewAction {
  type: TreeActionType;
  payload: TreeSemanticDomain;
}

export function TraverseTreeAction(
  newDomain: TreeSemanticDomain
): TreeViewAction {
  return { type: TreeActionType.TRAVERSE_TREE, payload: newDomain };
}
