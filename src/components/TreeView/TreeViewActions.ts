import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";

export enum TreeActionType {
  CLOSE_TREE = "CLOSE_TREE",
  OPEN_TREE = "OPEN_TREE",
  SET_PARENT_MAP = "SET_PARENT_MAP",
  TRAVERSE_TREE = "TRAVERSE_TREE",
}

export interface TreeViewAction {
  type: TreeActionType;
  domain?: TreeSemanticDomain;
  domainMap?: DomainMap;
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
  return { type: TreeActionType.TRAVERSE_TREE, domain: newDomain };
}

export function SetDomainMapAction(newDomainMap: DomainMap): TreeViewAction {
  return { type: TreeActionType.SET_PARENT_MAP, domainMap: newDomainMap };
}
