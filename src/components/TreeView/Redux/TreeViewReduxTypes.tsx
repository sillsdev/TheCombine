import { SemanticDomainTreeNode } from "api/models";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

export interface TreeViewState {
  currentDomain: SemanticDomainTreeNode;
  language: string;
  open: boolean;
}

export const rootId = "Sem";

export const defaultTreeNode = newSemanticDomainTreeNode(rootId);

export const defaultState: TreeViewState = {
  language: "",
  open: false,
  currentDomain: defaultTreeNode,
};
