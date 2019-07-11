import SemanticDomain from "./SemanticDomain";

export enum TreeActionType {
  TRAVERSE_TREE = "traverseTree"
}

export interface TreeViewAction {
  type: TreeActionType;
  payload: SemanticDomain;
}

export function TraverseTreeAction(newDomain: SemanticDomain): TreeViewAction {
  return { type: TreeActionType.TRAVERSE_TREE, payload: newDomain };
}
