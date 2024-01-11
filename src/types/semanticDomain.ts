import {
  SemanticDomain,
  SemanticDomainFull,
  SemanticDomainTreeNode,
  SemanticDomainCount,
  SemanticDomainUserCount,
} from "api/models";
import { getUserId } from "backend/localStorage";
import { Bcp47Code } from "types/writingSystem";

export function newSemanticDomain(
  id = "",
  name = "",
  lang = Bcp47Code.Default as string
): SemanticDomainFull {
  return { id, name, guid: "", questions: [], description: "", lang };
}

export function newSemanticDomainForMongoDB(
  dom: SemanticDomainTreeNode
): SemanticDomain {
  const { mongoId, guid, name, id } = dom;
  const lang = dom.lang || Bcp47Code.Default;
  const userId = getUserId();
  const created = new Date().toISOString();
  return { mongoId, guid, name, id, lang, userId, created };
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

export function newSemanticDomainUserCount(
  domainSet = new Set<string>()
): SemanticDomainUserCount {
  return { id: "", domainSet: domainSet };
}

export function newSemanticDomainCount(
  semanticDomainTreeNode: SemanticDomainTreeNode,
  count = 0
): SemanticDomainCount {
  return {
    semanticDomainTreeNode: semanticDomainTreeNode,
    count: count,
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

export function domainIdToArray(id: string): number[] {
  return id.split(".").map((digit) => parseInt(digit, 10));
}

export function compareDomains(a: SemanticDomain, b: SemanticDomain): number {
  const codeA = domainIdToArray(a.id);
  const codeB = domainIdToArray(b.id);
  for (let i = 0; i < codeA.length && i < codeB.length; i++) {
    if (codeA[i] !== codeB[i]) {
      return codeA[i] - codeB[i];
    }
  }

  return codeA.length - codeB.length;
}
