import { SemanticDomainTreeNode } from "api/models";

export enum TreeActionType {
  CLOSE_TREE = "CLOSE_TREE",
  OPEN_TREE = "OPEN_TREE",
  SET_DOMAIN_LANGUAGE = "SET_DOMAIN_LANGUAGE",
  SET_CURRENT_DOMAIN = "SET_CURRENT_DOMAIN",
}

export interface TreeViewAction {
  type: TreeActionType;
  domain?: SemanticDomainTreeNode;
  language?: string;
}
