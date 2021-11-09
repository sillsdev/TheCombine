import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

export enum TreeActionType {
  CLOSE_TREE = "CLOSE_TREE",
  OPEN_TREE = "OPEN_TREE",
  TRAVERSE_TREE = "TRAVERSE_TREE",
}

export interface TreeViewAction {
  type: TreeActionType;
  payload?: TreeSemanticDomain;
}

export function CloseTreeAction(): TreeViewAction {
  return { type: TreeActionType.CLOSE_TREE };
}

export function OpenTreeAction(): TreeViewAction {
  return { type: TreeActionType.OPEN_TREE };
}

export function TraverseTreeAction(
  newDomain: TreeSemanticDomain
): TreeViewAction {
  return { type: TreeActionType.TRAVERSE_TREE, payload: newDomain };
}
