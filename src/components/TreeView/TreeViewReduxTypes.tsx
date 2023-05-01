import { SemanticDomainTreeNode } from "api/models";
import i18n from "i18n";
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

export const defaultTreeNode = newSemanticDomainTreeNode(
  "Sem",
  "",
  i18n.language
);
