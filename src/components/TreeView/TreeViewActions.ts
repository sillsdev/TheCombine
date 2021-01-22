import SemanticDomainWithSubdomains from "types/SemanticDomain";

export enum TreeActionType {
  TRAVERSE_TREE = "traverseTree",
}

export interface TreeViewAction {
  type: TreeActionType;
  payload: SemanticDomainWithSubdomains;
}

export function TraverseTreeAction(
  newDomain: SemanticDomainWithSubdomains
): TreeViewAction {
  return { type: TreeActionType.TRAVERSE_TREE, payload: newDomain };
}
