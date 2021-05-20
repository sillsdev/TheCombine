import { SemanticDomain } from "types/word";

export default interface SemanticDomainWithSubdomains extends SemanticDomain {
  // Data of current domain
  questions: string[];

  // Data about tangential domains
  parentDomain?: SemanticDomainWithSubdomains;
  subdomains: SemanticDomainWithSubdomains[];
}

export const baseDomain: SemanticDomainWithSubdomains = {
  ...new SemanticDomain(),
  subdomains: [],
  questions: [],
};
