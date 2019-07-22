export default interface SemanticDomain {
  // Data of current domain
  name: string;
  id: string;

  // Data about tangential domains
  parentDomain?: SemanticDomain;
  subdomains: SemanticDomain[];
}
