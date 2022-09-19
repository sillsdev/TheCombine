import { SemanticDomainWithSubdomains } from "api/models";

export default class TreeSemanticDomain
  implements SemanticDomainWithSubdomains
{
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
