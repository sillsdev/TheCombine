import { SemanticDomainTreeNode } from "api/models";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

export enum TreeActionType {
  CLOSE_TREE = "CLOSE_TREE",
  OPEN_TREE = "OPEN_TREE",
  RESET_TREE = "RESET_TREE",
  SET_DOMAIN_LANGUAGE = "SET_DOMAIN_LANGUAGE",
  SET_CURRENT_DOMAIN = "SET_CURRENT_DOMAIN",
}

export interface TreeViewAction {
  type: TreeActionType;
  domain?: SemanticDomainTreeNode;
  language?: string;
}

export interface TreeViewState {
  currentDomain: SemanticDomainTreeNode;
  language: string;
  open: boolean;
}

export const defaultTreeNode = newSemanticDomainTreeNode("Sem");

export const defaultState: TreeViewState = {
  language: "",
  open: false,
  currentDomain: defaultTreeNode,
};
