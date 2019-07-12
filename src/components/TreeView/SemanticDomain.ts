export default interface SemanticDomain {
  // Data of current domain
  name: string;
  number: string;

  // Data about tangential domains
  parentDomain?: SemanticDomain;
  subDomains: SemanticDomain[];
}
