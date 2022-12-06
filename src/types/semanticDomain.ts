import {
  SemanticDomain,
  SemanticDomainFull,
  SemanticDomainTreeNode,
} from "api/models";
import { Bcp47Code } from "types/writingSystem";

export function newSemanticDomain(
  id = "",
  name = "",
  lang = Bcp47Code.Default as string
): SemanticDomainFull {
  return { id, name, guid: "", questions: [], description: "", lang };
}

export function newSemanticDomainTreeNode(
  id = "",
  name = "",
  lang = Bcp47Code.Default as string
): SemanticDomainTreeNode {
  return {
    parent: undefined,
    previous: undefined,
    next: undefined,
    children: [],
    id,
    name,
    lang,
    guid: "",
  };
}

export function semDomFromTreeNode(
  node: SemanticDomainTreeNode
): SemanticDomainFull {
  const dom = newSemanticDomain(node.id, node.name, node.lang);
  return { ...dom, guid: node.guid };
}

export function treeNodeFromSemDom(
  dom: SemanticDomain
): SemanticDomainTreeNode {
  const node = newSemanticDomainTreeNode(dom.id, dom.name, dom.lang);
  return { ...node, guid: dom.guid };
}

export type TreeNodeMap = Record<string, SemanticDomainTreeNode>;
