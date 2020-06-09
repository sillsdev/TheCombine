export default interface SemanticDomainWithSubdomains {
  // Data of current domain
  name: string;
  id: string;
  description: string;
  //  questions: string[];

  // Data about tangential domains
  parentDomain?: SemanticDomainWithSubdomains;
  subdomains: SemanticDomainWithSubdomains[];
}
