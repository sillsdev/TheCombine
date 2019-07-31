export default interface SemanticDomainWithSubdomains {
  // Data of current domain
  name: string;
  id: string;
  description: string;

  // Data about tangential domains
  parentDomain?: SemanticDomainWithSubdomains;
  subdomains: SemanticDomainWithSubdomains[];
}
