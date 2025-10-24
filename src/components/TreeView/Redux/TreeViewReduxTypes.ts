import { SemanticDomainTreeNode } from "api/models";
import { newSemanticDomainTreeNode, rootId } from "types/semanticDomain";

export interface TreeViewState {
  currentDomain: SemanticDomainTreeNode;
  language: string;
  open: boolean;
}

export const defaultTreeNode = newSemanticDomainTreeNode(rootId);

export const defaultState: TreeViewState = {
  language: "",
  open: false,
  currentDomain: defaultTreeNode,
};
