import {
  SemanticDomain,
  SemanticDomainTreeNode,
  SemanticDomainWithSubdomains,
} from "api/models";

export function newSemanticDomain(id = "", name = ""): SemanticDomain {
  return { id, name };
}

export function newSemanticDomainTreeNode(
  id = "",
  name = ""
): SemanticDomainTreeNode {
  return {
    node: newSemanticDomain(id, name),
    parent: newSemanticDomain(),
    previous: newSemanticDomain(),
    next: newSemanticDomain(),
    children: [],
  };
}

export class TreeSemanticDomain implements SemanticDomainWithSubdomains {
  id: string;
  name: string;
  description = "";
  subdomains: TreeSemanticDomain[] = [];

  // Additional fields not in SemanticDomainWithSubdomains
  parentId?: string;
  childIds: string[] = [];
  questions: string[] = [];

  constructor(id = "", name = "") {
    this.id = id;
    this.name = name;
  }
}

export type DomainMap = Record<string, TreeSemanticDomain>;
