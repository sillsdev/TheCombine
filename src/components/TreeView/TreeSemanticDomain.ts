import { SemanticDomainWithSubdomains } from "api/models";

export default class TreeSemanticDomain
  implements SemanticDomainWithSubdomains {
  id: string;
  name: string;
  description: string = "";
  subdomains: TreeSemanticDomain[] = [];

  // Additional fields not in SemanticDomainWithSubdomains
  parentDomain?: TreeSemanticDomain;
  questions: string[] = [];

  constructor(id: string = "", name: string = "") {
    this.id = id;
    this.name = name;
  }
}
