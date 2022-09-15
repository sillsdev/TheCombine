import { SemanticDomainFull, SemanticDomainTreeNode } from "api/models";

export function newSemanticDomain(
  id = "",
  name = "",
  lang = "en"
): SemanticDomainFull {
  return { id, name, guid: "", questions: [], description: "", lang };
}

export function newSemanticDomainTreeNode(
  id = "",
  name = "",
  lang = "en"
): SemanticDomainTreeNode {
  return {
    parent: undefined,
    previous: undefined,
    next: undefined,
    children: undefined,
    id,
    name,
    lang,
    guid: "",
  };
}

export type DomainMap = Record<string, SemanticDomainTreeNode>;
